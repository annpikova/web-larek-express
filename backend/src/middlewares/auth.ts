import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import UnauthorizedError from '../errors/UnauthorizedError';

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

export default (req: AuthRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, config.JWT_SECRET) as { _id: string };
  } catch (err) {
    return next(new UnauthorizedError('Неверный токен'));
  }

  req.user = payload;
  return next();
};
