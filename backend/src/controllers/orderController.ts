import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import BadRequestError from '../errors/BadRequestError';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { total, items } = req.body;

  try {
    // Валидация товаров
    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new BadRequestError(ERROR_MESSAGES.ORDER_ITEMS_REQUIRED));
    }

    // Проверяем существование товаров и их доступность
    const products = await Product.find({ _id: { $in: items } });

    if (products.length !== items.length) {
      return next(new BadRequestError('Один или несколько товаров не найдены'));
    }

    // Проверяем, что все товары продаются (price не null)
    const unavailableProducts = products.filter((product) => product.price === null);
    if (unavailableProducts.length > 0) {
      return next(new BadRequestError('Некоторые товары недоступны для заказа'));
    }

    // Проверяем, что сумма товаров равна переданной сумме
    const calculatedTotal = products.reduce((sum, product) => sum + (product.price || 0), 0);
    if (calculatedTotal !== total) {
      return next(new BadRequestError('Сумма заказа не соответствует стоимости товаров'));
    }

    // Генерируем ID заказа
    const orderId = faker.string.uuid();

    res.status(HTTP_STATUS.CREATED).json({
      id: orderId,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export { createOrder };
