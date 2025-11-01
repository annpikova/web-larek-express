import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { HTTP_STATUS } from '../constants';
import config from '../config';

const uploadFile = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.file) {
    next(new Error('Файл не был загружен'));
    return;
  }

  const { originalname } = req.file;
  const fileExtension = path.extname(originalname);
  const uniqueFileName = `${randomUUID()}${fileExtension}`;

  // Перемещаем файл из временной папки в постоянную
  const tempPath = path.join(config.UPLOAD_TEMP_DIR, req.file.filename);
  const finalPath = path.join(config.UPLOAD_FINAL_DIR, uniqueFileName);

  try {
    if (fs.existsSync(tempPath)) {
      fs.copyFileSync(tempPath, finalPath);
      fs.unlinkSync(tempPath);
    }
  } catch (error) {
    next(new Error('Ошибка при сохранении файла'));
    return;
  }

  res.status(HTTP_STATUS.OK).json({
    fileName: `/images/${uniqueFileName}`,
    originalName: originalname,
  });
};

export default uploadFile;
