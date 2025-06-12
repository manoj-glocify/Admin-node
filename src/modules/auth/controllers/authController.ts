import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { CreateUserDto } from '../../../types/prisma';
import { logger } from '../../../utils/logger';
import { emailService } from '../../notifications/services/emailService';

// JWT Configuration
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_OPTIONS: SignOptions = {
  expiresIn: '24h' // Using a fixed value to avoid type issues
};

// Validate JWT configuration
if (!process.env.JWT_SECRET) {
  logger.warn('JWT_SECRET is not set in environment variables. Using default secret key.');
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get default role
    const defaultRole = await prisma.role.findFirst({
      where: { isDefault: true }
    });
    
    if (!defaultRole) {
      return res.status(500).json({ message: 'No default role found' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roleId: defaultRole.id
      },
      include: {
        role: true
      }
    });

    // Try to send emails, but don't fail if they don't send
    try {
      // Send welcome email to user
      await emailService.sendUserRegistrationNotification(email, firstName);

      // Send notification to admin
      if (process.env.ADMIN_EMAIL) {
        await emailService.sendAdminNewUserNotification(process.env.ADMIN_EMAIL, {
          firstName,
          lastName,
          email,
        });
      }
    } catch (emailError) {
      // Log the email error but continue with registration
      logger.warn('Failed to send registration emails:', emailError);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      JWT_OPTIONS
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      JWT_OPTIONS
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profile } = req.user as any;
    const { id, emails, name } = profile;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { googleId: id },
      include: {
        role: true
      }
    });
    
    if (!user) {
      const defaultRole = await prisma.role.findFirst({
        where: { isDefault: true }
      });
      
      if (!defaultRole) {
        return res.status(500).json({ message: 'No default role found' });
      }

      user = await prisma.user.create({
        data: {
          email: emails[0].value,
          firstName: name.givenName,
          lastName: name.familyName,
          googleId: id,
          roleId: defaultRole.id
        },
        include: {
          role: true
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      JWT_OPTIONS
    );

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  // Since we're using JWT, we don't need to do anything on the server side
  // The client should remove the token
  res.json({ message: 'Logged out successfully' });
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req.user as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Send password changed notification
    await emailService.sendPasswordChangedNotification(user.email, user.firstName);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.json({ message: 'If your email is registered, you will receive a password reset link' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_RESET_SECRET || JWT_SECRET,
      { expiresIn: '1h' } as SignOptions
    );

    // Send reset link email
    await emailService.sendPasswordResetLink(user.email, user.firstName, resetToken);

    res.json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || JWT_SECRET) as { userId: string };

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    // Send password changed notification
    await emailService.sendPasswordChangedNotification(user.email, user.firstName);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    next(error);
  }
}; 