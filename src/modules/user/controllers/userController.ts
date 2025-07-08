import {Request, Response, NextFunction} from "express";
// import {User} from "@prisma/client";
import {updateUserSchema} from "../dto/user.dto";
import {AppError} from "../../../middleware/errorHandler";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export const profileLists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userlists = await prisma.user.findMany({
      include: {
        role: true,
      },
    });
    res.json({userlists});
    // res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {email, password, firstName, lastName, roleId} = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {email},
    });

    if (existingUser) {
      return res.status(400).json({message: "User already exists"});
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
        roleId,
      },
      include: {
        role: true,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      // token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {id} = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {id},
    });
    if (!user) return res.status(404).json({message: "User not found"});
    res.json(user);
  } catch (error) {
    res.status(500).json({message: "Server error"});
  }
};

export const updateUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {id} = req.params;
  try {
    if (!id) {
      throw new AppError("Unauthorized", 401);
    }

    const {firstName, lastName, email, isActive, roleId} =
      req.body as updateUserSchema;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [{email: email}, {id: {not: id}}],
        },
      });

      if (existingUser) {
        throw new AppError("Email is already taken", 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: {id: id},
      data: {
        firstName,
        lastName,
        email,
        isActive,
        roleId,
      },
      include: {
        role: true,
      },
    });

    // res.json(updatedUser);
    res
      .status(200)
      .json({message: "User updated successfully", userdata: updatedUser});
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {id} = req.params;

    // Check if role exists
    const existingRole = await prisma.user.findUnique({
      where: {id},
    });

    if (!existingRole) {
      throw new AppError("User not found", 404);
    }

    // Then delete the user
    await prisma.user.delete({
      where: {id},
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
