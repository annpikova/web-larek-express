"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const UnauthorizedError_1 = __importDefault(require("../errors/UnauthorizedError"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const ConflictError_1 = __importDefault(require("../errors/ConflictError"));
const InternalServerError_1 = __importDefault(require("../errors/InternalServerError"));
exports.default = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Внутренняя ошибка сервера';
    if (error instanceof BadRequestError_1.default) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof UnauthorizedError_1.default) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof NotFoundError_1.default) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof ConflictError_1.default) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof InternalServerError_1.default) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof mongoose_1.Error.ValidationError) {
        statusCode = 400;
        message = 'Ошибка валидации данных';
    }
    else if (error instanceof Error && error.message.includes('E11000')) {
        statusCode = 409;
        message = 'Пользователь с таким email уже существует';
    }
    else if (error instanceof Error && error.message.includes('jwt')) {
        statusCode = 401;
        message = 'Неверный токен';
    }
    res.status(statusCode).json({ message });
};
