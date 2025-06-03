import { Request, Response, NextFunction } from 'express';
import prisma from '../../../lib/prisma';
import { CreateRoleDto, UpdateRoleDto, PermissionDto } from '../dto/role.dto';
import { AppError } from '../../../middleware/errorHandler';

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, isDefault, permissions } = req.body as CreateRoleDto;

    // Check if role with same name exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      throw new AppError('Role with this name already exists', 400);
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        isDefault: isDefault || false,
        permissions: {
          create: permissions?.map((permission: PermissionDto) => ({
            module: permission.module,
            actions: permission.actions
          })) || []
        }
      },
      include: {
        permissions: true
      }
    });

    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true
      }
    });

    res.json(roles);
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true
      }
    });

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
    const { id } = req.params;
    const { name, description, isDefault, permissions } = req.body as UpdateRoleDto;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      throw new AppError('Role not found', 404);
    }

    // If name is being updated, check if new name is already taken
    if (name && name !== existingRole.name) {
      const roleWithSameName = await prisma.role.findUnique({
        where: { name }
      });

      if (roleWithSameName) {
        throw new AppError('Role with this name already exists', 400);
      }
    }

    // First, delete existing permissions
    await prisma.permission.deleteMany({
      where: { roleId: id }
    });

    // Then update the role with new permissions
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        isDefault,
        permissions: {
          create: permissions?.map((permission: PermissionDto) => ({
            module: permission.module,
            actions: permission.actions
          })) || []
        }
      },
      include: {
        permissions: true
      }
    });

    res.json(updatedRole);
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      throw new AppError('Role not found', 404);
    }

    // Check if role is assigned to any users
    const usersWithRole = await prisma.user.findFirst({
      where: { roleId: id }
    });

    if (usersWithRole) {
      throw new AppError('Cannot delete role that is assigned to users', 400);
    }

    // Delete permissions first
    await prisma.permission.deleteMany({
      where: { roleId: id }
    });

    // Then delete the role
    await prisma.role.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 