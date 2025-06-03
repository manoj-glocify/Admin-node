import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { CreateUserDto } from '../../../types/prisma';
import { logger } from '../../../utils/logger';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_OPTIONS: SignOptions = {
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};

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