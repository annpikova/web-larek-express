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

  // Перемещаем файл из временной папки в постоянную с защитой от path traversal
  const tempDir = path.resolve(process.cwd(), config.UPLOAD_TEMP_DIR);
  const finalDir = path.resolve(process.cwd(), config.UPLOAD_FINAL_DIR);

  const tempPath = path.join(tempDir, req.file.filename);
  const finalPath = path.join(finalDir, uniqueFileName);

  // Проверка на выход за пределы директории
  if (!finalPath.startsWith(finalDir)) {
    next(new Error('Неверное имя файла'));
    return;
  }

  try {
    // Создаем директорию, если её нет
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

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
