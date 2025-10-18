"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const UnauthorizedError_1 = __importDefault(require("../errors/UnauthorizedError"));
exports.default = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return next(new UnauthorizedError_1.default('Необходима авторизация'));
    }
    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
    }
    catch (err) {
        return next(new UnauthorizedError_1.default('Неверный токен'));
    }
    req.user = payload;
    return next();
};
