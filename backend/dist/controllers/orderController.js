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
const constants_1 = require("../constants");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { total, items, } = req.body;
        // здесь тело уже провалидировано celebrate, но на всякий случай:
        if (!Array.isArray(items) || items.length === 0) {
            return next(new BadRequestError_1.default('Поле "items" должно быть заполнено'));
        }
        // Проверяем, что все id валидные строки и не пустые
        const validIds = items
            .filter((id) => typeof id === 'string' && id.trim().length > 0)
            .map((id) => id.trim());
        if (validIds.length !== items.length) {
            return next(new BadRequestError_1.default('Некорректный идентификатор товара'));
        }
        // Проверяем, что все id являются валидными ObjectId
        const invalidId = validIds.find((id) => !mongoose_1.Types.ObjectId.isValid(id));
        if (invalidId) {
            return next(new BadRequestError_1.default('Некорректный идентификатор товара'));
        }
        // Создаем ObjectId только после проверки валидности
        const objectIds = validIds.map((id) => new mongoose_1.Types.ObjectId(id));
        const products = yield product_1.default.find({
            _id: { $in: objectIds },
        });
        // 1) все ли товары существуют
        if (products.length !== items.length) {
            return next(new BadRequestError_1.default('Некоторые товары не найдены'));
        }
        // 2) все ли товары продаются (price !== null)
        if (products.some((p) => p.price === null || p.price === undefined)) {
            return next(new BadRequestError_1.default('В заказе есть товар без цены'));
        }
        // 3) совпадает ли сумма
        const sum = products.reduce((acc, p) => acc + p.price, 0);
        if (typeof total !== 'number') {
            return next(new BadRequestError_1.default('Поле "total" должно быть числом'));
        }
        if (sum !== total) {
            return next(new BadRequestError_1.default('Сумма заказа не совпадает с total'));
        }
        // успех — по условиям заказы не сохраняем в БД
        const id = faker_1.faker.string.uuid();
        return res.status(constants_1.HTTP_STATUS.OK).json({ id, total: sum });
    }
    catch (err) {
        return next(err);
    }
});
exports.default = createOrder;
