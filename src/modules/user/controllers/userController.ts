import {Request, Response, NextFunction} from "express";
// import {User} from "@prisma/client";
// import {userSchema} from "../dto/user.dto.ts";
// import {AppError} from "../../../middleware/errorHandler";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export const profileLists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userlists = await prisma.user.findMany();
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
      include: {
        role: true,
      },
    });
    if (!user) return res.status(404).json({message: "User not found"});
    res.json(user);
  } catch (error) {
    res.status(500).json({message: "Server error"});
  }
};
