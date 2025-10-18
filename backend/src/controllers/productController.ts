import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import Product from '../models/product';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import ConflictError from '../errors/ConflictError';
import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';
import { config } from '../config';

const getAllProducts = (_req: Request, res: Response, next: NextFunction) => {
  Product.find()
    .then((products) => {
      res.status(HTTP_STATUS.OK)
        .json({
          items: products,
          total: products.length,
        });
    })
    .catch((error) => {
      next(error);
    });
};

const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    description,
    image,
    title,
    category,
    price,
  } = req.body;

  // Перемещаем файл из временной папки в постоянную
  if (image && image.fileName) {
    const tempPath = path.join(config.UPLOAD_TEMP_DIR, path.basename(image.fileName));
    const finalPath = path.join(config.UPLOAD_FINAL_DIR, path.basename(image.fileName));

    try {
      if (fs.existsSync(tempPath)) {
        fs.copyFileSync(tempPath, finalPath);
        fs.unlinkSync(tempPath); // Удаляем временный файл
        image.fileName = `/images/${path.basename(image.fileName)}`;
      }
    } catch (error) {
      console.error('Ошибка при перемещении файла:', error);
    }
  }

  Product.create({
    description,
    image,
    title,
    category,
    price,
  })
    .then((product) => {
      res.status(HTTP_STATUS.CREATED)
        .json(product);
    })
    .catch((error) => {
      if (error instanceof Error && error.message.includes('E11000')) {
        return next(new ConflictError(ERROR_MESSAGES.PRODUCT_DUPLICATE_TITLE));
      }

      if (error.name === 'ValidationError') {
        return next(new BadRequestError(ERROR_MESSAGES.VALIDATION_ERROR));
      }

      return next(error);
    });
};

const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const updateData = req.body;

  // Если передано новое изображение, перемещаем файл
  if (updateData.image && updateData.image.fileName) {
    const tempPath = path.join(config.UPLOAD_TEMP_DIR, path.basename(updateData.image.fileName));
    const finalPath = path.join(config.UPLOAD_FINAL_DIR, path.basename(updateData.image.fileName));

    try {
      if (fs.existsSync(tempPath)) {
        fs.copyFileSync(tempPath, finalPath);
        fs.unlinkSync(tempPath);
        updateData.image.fileName = `/images/${path.basename(updateData.image.fileName)}`;
      }
    } catch (error) {
      console.error('Ошибка при перемещении файла:', error);
    }
  }

  Product.findByIdAndUpdate(
    productId,
    updateData,
    { runValidators: true, new: true },
  )
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'));
      }
      res.status(HTTP_STATUS.OK).json({ item: product });
    })
    .catch((error) => {
      if (error instanceof Error && error.message.includes('E11000')) {
        return next(new ConflictError(ERROR_MESSAGES.PRODUCT_DUPLICATE_TITLE));
      }
      return next(error);
    });
};

const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;

  Product.findByIdAndDelete(productId)
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'));
      }
      res.status(HTTP_STATUS.OK).json({ item: product });
    })
    .catch((error) => {
      next(error);
    });
};

export {
  getAllProducts, createProduct, updateProduct, deleteProduct,
};
