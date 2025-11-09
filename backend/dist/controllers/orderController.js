"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const product_1 = __importDefault(require("../models/product"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { payment, email, phone, address, total, items, } = req.body;
        // Обязательные поля
        if (!payment || !email || !phone || !address) {
            return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Поле "items" должно быть массивом с товарами' });
        }
        // Нормализуем и проверяем id
        const rawIds = items.map((id) => (typeof id === 'string' ? id.trim() : ''));
        const filtered = rawIds.filter((id) => id.length > 0);
        if (filtered.length !== rawIds.length) {
            return res.status(400).json({ message: 'Некорректный идентификатор товара' });
        }
        const invalid = filtered.find((id) => !mongoose_1.Types.ObjectId.isValid(id));
        if (invalid) {
            return res.status(400).json({ message: 'Некорректный идентификатор товара' });
        }
        const objectIds = filtered.map((id) => new mongoose_1.Types.ObjectId(id));
        // Забираем товары
        const products = yield product_1.default.find({ _id: { $in: objectIds } });
        if (products.length !== objectIds.length) {
            return res.status(400).json({ message: 'Некоторые товары не найдены' });
        }
        // Проверяем, что все товары продаются (price !== null)
        if (products.some((p) => p.price === null || p.price === undefined)) {
            return res.status(400).json({ message: 'В заказе есть товар без цены' });
        }
        // Считаем сумму
        const sum = products.reduce((acc, p) => { var _a; return acc + ((_a = p.price) !== null && _a !== void 0 ? _a : 0); }, 0);
        if (typeof total !== 'number') {
            return res.status(400).json({ message: 'Поле "total" должно быть числом' });
        }
        if (sum !== total) {
            return res.status(400).json({ message: 'Сумма заказа не совпадает с total' });
        }
        // Успех
        const id = faker_1.faker.string.uuid();
        return res.status(200).json({ id, total: sum });
    }
    catch (e) {
        // Если что-то совсем пошло не так — всё равно 500
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});
exports.default = createOrder;
