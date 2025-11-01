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
exports.getCurrentUser = exports.logout = exports.refreshAccessToken = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const constants_1 = require("../constants");
const config_1 = __importDefault(require("../config"));
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const UnauthorizedError_1 = __importDefault(require("../errors/UnauthorizedError"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const ConflictError_1 = __importDefault(require("../errors/ConflictError"));
// Вспомогательная функция для генерации токенов
const getTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ _id: user._id.toString() }, config_1.default.JWT_SECRET, { expiresIn: '10m' });
    const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id.toString(), type: 'refresh' }, config_1.default.JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield user_1.default.create({
            name: name || 'Ё-мое',
            email,
            password: hashedPassword,
            tokens: [],
        });
        const { accessToken, refreshToken } = getTokens(user);
        // Сохраняем refresh токен в базе
        if (!user.tokens) {
            user.tokens = []; // Если массива нет, то установим его
        }
        user.tokens.push({ token: refreshToken });
        yield user.save();
        // Устанавливаем httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
            path: '/',
        });
        res.status(constants_1.HTTP_STATUS.CREATED).json({
            user: {
                email: user.email,
                name: user.name,
            },
            success: true,
            accessToken,
        });
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('E11000')) {
            next(new ConflictError_1.default(constants_1.ERROR_MESSAGES.USER_ALREADY_EXISTS));
            return;
        }
        if (error instanceof Error && error.name === 'ValidationError') {
            next(new BadRequestError_1.default(constants_1.ERROR_MESSAGES.VALIDATION_ERROR));
            return;
        }
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_1.default.findOne({ email }).select('+password');
        if (!user) {
            next(new UnauthorizedError_1.default(constants_1.ERROR_MESSAGES.INVALID_CREDENTIALS));
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            next(new UnauthorizedError_1.default(constants_1.ERROR_MESSAGES.INVALID_CREDENTIALS));
            return;
        }
        const { accessToken, refreshToken } = getTokens(user);
        // Сохраняем refresh токен в базе
        if (!user.tokens) {
            user.tokens = []; // Если массива нет, то установим его
        }
        user.tokens.push({ token: refreshToken });
        yield user.save();
        // Устанавливаем httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
            path: '/',
        });
        res.status(constants_1.HTTP_STATUS.OK).json({
            user: {
                email: user.email,
                name: user.name,
            },
            success: true,
            accessToken,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const refreshAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        next(new UnauthorizedError_1.default('Refresh токен не найден'));
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, config_1.default.JWT_SECRET);
        const user = yield user_1.default.findById(payload._id).select('+tokens');
        if (!user || !user.tokens.some((tokenObj) => tokenObj.token === refreshToken)) {
            next(new UnauthorizedError_1.default('Неверный refresh токен'));
            return;
        }
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = getTokens(user);
        // Удаляем старый refresh токен и добавляем новый
        if (!user.tokens) {
            user.tokens = []; // Если массива нет, то установим его
        }
        user.tokens = user.tokens.filter((tokenObj) => tokenObj.token !== refreshToken);
        user.tokens.push({ token: newRefreshToken });
        yield user.save();
        // Устанавливаем новый httpOnly cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
            path: '/',
        });
        res.status(constants_1.HTTP_STATUS.OK).json({
            user: {
                email: user.email,
                name: user.name,
            },
            success: true,
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        next(new UnauthorizedError_1.default('Неверный refresh токен'));
    }
});
exports.refreshAccessToken = refreshAccessToken;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        next(new BadRequestError_1.default('Refresh токен не найден'));
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, config_1.default.JWT_SECRET);
        const user = yield user_1.default.findById(payload._id);
        if (!user) {
            next(new NotFoundError_1.default(constants_1.ERROR_MESSAGES.USER_NOT_FOUND));
            return;
        }
        // Удаляем refresh токен из базы
        if (!user.tokens) {
            user.tokens = []; // Если массива нет, то установим его
        }
        user.tokens = user.tokens.filter((tokenObj) => tokenObj.token !== refreshToken);
        yield user.save();
        // Очищаем cookie
        res.clearCookie('refreshToken');
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
        });
    }
    catch (error) {
        next(new BadRequestError_1.default('Неверный refresh токен'));
    }
});
exports.logout = logout;
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    try {
        const user = yield user_1.default.findById(_id);
        if (!user) {
            next(new NotFoundError_1.default(constants_1.ERROR_MESSAGES.USER_NOT_FOUND));
            return;
        }
        res.status(constants_1.HTTP_STATUS.OK).json({
            user: {
                email: user.email,
                name: user.name,
            },
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCurrentUser = getCurrentUser;
