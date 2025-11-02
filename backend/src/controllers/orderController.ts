import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import Product from '../models/product';
import { HTTP_STATUS } from '../constants';
import BadRequestError from '../errors/BadRequestError';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      total, items,
    } = req.body;

    // здесь тело уже провалидировано celebrate, но на всякий случай:
    if (!Array.isArray(items) || items.length === 0) {
      return next(new BadRequestError('Поле "items" должно быть заполнено'));
    }

    // Проверяем, что все id валидные строки и не пустые
    const validIds = items
      .filter((id: string) => typeof id === 'string' && id.trim().length > 0)
      .map((id: string) => id.trim());

    if (validIds.length !== items.length) {
      return next(new BadRequestError('Некорректный идентификатор товара'));
    }

    // Проверяем, что все id являются валидными ObjectId
    const invalidId = validIds.find((id) => !Types.ObjectId.isValid(id));
    if (invalidId) {
      return next(new BadRequestError('Некорректный идентификатор товара'));
    }

    // Создаем ObjectId только после проверки валидности
    const objectIds = validIds.map((id: string) => new Types.ObjectId(id));

    const products = await Product.find({
      _id: { $in: objectIds },
    });

    // 1) все ли товары существуют
    if (products.length !== items.length) {
      return next(new BadRequestError('Некоторые товары не найдены'));
    }

    // 2) все ли товары продаются (price !== null)
    if (products.some((p) => p.price === null || p.price === undefined)) {
      return next(new BadRequestError('В заказе есть товар без цены'));
    }

    // 3) совпадает ли сумма
    const sum = products.reduce((acc, p) => acc + (p.price as number), 0);

    if (typeof total !== 'number') {
      return next(new BadRequestError('Поле "total" должно быть числом'));
    }

    if (sum !== total) {
      return next(new BadRequestError('Сумма заказа не совпадает с total'));
    }

    // успех — по условиям заказы не сохраняем в БД
    const id = faker.string.uuid();
    return res.status(HTTP_STATUS.OK).json({ id, total: sum });
  } catch (err) {
    return next(err);
  }
};

export default createOrder;
