import {Request, Response, NextFunction} from "express";
import {User} from "@prisma/client";
import {UpdateProfileDto, ChangePasswordDto} from "../dto/profile.dto";
import {AppError} from "../../../middleware/errorHandler";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: {id: req.user.id},
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const {firstName, lastName, email} = req.body as UpdateProfileDto;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: {email},
      });

      if (existingUser) {
        throw new AppError("Email is already taken", 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: {id: req.user.id},
      data: {
        firstName,
        lastName,
        email,
      },
      include: {
        role: true,
      },
    });

    res.json({status: 200, message: "user details updated successfully"});
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const {currentPassword, newPassword} = req.body as ChangePasswordDto;

    const user = await prisma.user.findUnique({
      where: {id: req.user.id},
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password || ""
    );
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {id: req.user.id},
      data: {password: hashedPassword},
    });
    res.json({message: "Password updated successfully"});
  } catch (error) {
    next(error);
  }
};

export const updateProfilePic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    // Check if file is present
    if (!req.file) {
      throw new AppError("No image file provided", 400);
    }
    const imagePath = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    const updatedUser = await prisma.user.update({
      where: {id: req.user.id},
      data: {avartar: imagePath},
    });

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: imagePath,
    });
  } catch (error) {
    next(error);
  }
};
