import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/BadRequestError';
import UnauthorizedError from '../errors/UnauthorizedError';
import NotFoundError from '../errors/NotFoundError';
import ConflictError from '../errors/ConflictError';
import InternalServerError from '../errors/InternalServerError';

export default (error: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера';

  if (error instanceof BadRequestError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof UnauthorizedError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof NotFoundError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof InternalServerError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = 'Ошибка валидации данных';
  } else if (error instanceof Error && error.message.includes('E11000')) {
    statusCode = 409;
    message = 'Пользователь с таким email уже существует';
  } else if (error instanceof Error && error.message.includes('jwt')) {
    statusCode = 401;
    message = 'Неверный токен';
  }

  res.status(statusCode).json({ message });
};
