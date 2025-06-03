import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { User } from '../modules/auth/models/User';

export const checkPermission = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user?.userId).populate('role');
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const role = user.role as any;
      const permission = role.permissions.find(
        (p: any) => p.module === module && p.actions.includes(action)
      );

      if (!permission) {
        throw new AppError('Permission denied', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 