import { Request, Response, NextFunction } from 'express';
import { Role } from '../models/Role';
import { AppError } from '../../../middleware/errorHandler';

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, permissions, isDefault } = req.body;

    const role = await Role.create({
      name,
      description,
      permissions,
      isDefault,
    });

    res.status(201).json({
      message: 'Role created successfully',
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

export const getRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    res.json(role);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, permissions, isDefault } = req.body;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        permissions,
        isDefault,
      },
      { new: true, runValidators: true }
    );

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    res.json({
      message: 'Role updated successfully',
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (role.isDefault) {
      throw new AppError('Cannot delete default role', 400);
    }

    await role.deleteOne();

    res.json({
      message: 'Role deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}; 