import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AppError } from './errorHandler';
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: User | false, info: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(new AppError('Unauthorized', 401));
    }

    req.user = user;
    next();
  })(req, res, next);
}; 