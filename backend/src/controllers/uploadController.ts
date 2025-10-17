import { NextFunction, Request, Response } from 'express';
import path from 'path';
import { randomUUID } from 'crypto';
import { HTTP_STATUS } from '../constants';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new Error('Файл не был загружен'));
  }

  const { originalname } = req.file;
  const fileExtension = path.extname(originalname);
  const uniqueFileName = `${randomUUID()}${fileExtension}`;

  res.status(HTTP_STATUS.OK).json({
    fileName: `/images/${uniqueFileName}`,
    originalName: originalname,
  });
};

export { uploadFile };
