import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import Product from '../models/product';

const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    // Обязательные поля
    if (!payment || !email || !phone || !address) {
      return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Поле "items" должно быть массивом с товарами' });
    }

    // Нормализуем и проверяем id
    const rawIds = items.map((id: unknown) => (typeof id === 'string' ? id.trim() : ''));
    const filtered = rawIds.filter((id) => id.length > 0);

    if (filtered.length !== rawIds.length) {
      return res.status(400).json({ message: 'Некорректный идентификатор товара' });
    }

    const invalid = filtered.find((id) => !Types.ObjectId.isValid(id));
    if (invalid) {
      return res.status(400).json({ message: 'Некорректный идентификатор товара' });
    }

    const objectIds = filtered.map((id) => new Types.ObjectId(id));

    // Забираем товары
    const products = await Product.find({ _id: { $in: objectIds } });

    if (products.length !== objectIds.length) {
      return res.status(400).json({ message: 'Некоторые товары не найдены' });
    }

    // Проверяем, что все товары продаются (price !== null)
    if (products.some((p) => p.price === null || p.price === undefined)) {
      return res.status(400).json({ message: 'В заказе есть товар без цены' });
    }

    // Считаем сумму
    const sum = products.reduce((acc, p) => acc + (p.price ?? 0), 0);

    if (typeof total !== 'number') {
      return res.status(400).json({ message: 'Поле "total" должно быть числом' });
    }

    if (sum !== total) {
      return res.status(400).json({ message: 'Сумма заказа не совпадает с total' });
    }

    // Успех
    const id = faker.string.uuid();
    return res.status(200).json({ id, total: sum });
  } catch (e) {
    // Если что-то совсем пошло не так — всё равно 500
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export default createOrder;
