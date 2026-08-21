import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';
import { AUTH_JWT_SECRET } from '../config';

interface JwtPayload {
  _id: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

const auth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, AUTH_JWT_SECRET) as JwtPayload;
    req.user = payload;
    return next();
  } catch {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};

export default auth;
