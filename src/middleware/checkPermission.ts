import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import { AppError } from './errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkPermission = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user) {
        throw new AppError('Unauthorized', 401);
      }

      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: {
            include: {
              permissions: true
            }
          }
        }
      });

      if (!userWithRole?.role) {
        throw new AppError('No role assigned', 403);
      }

      const hasPermission = userWithRole.role.permissions.some(
        (permission) => permission.module === module && permission.actions.includes(action)
      );

      if (!hasPermission) {
        throw new AppError('Permission denied', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 