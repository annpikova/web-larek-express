"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("./types/express");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const celebrate_1 = require("celebrate");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const config_1 = __importDefault(require("./config"));
const logger_1 = require("./middlewares/logger");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const csrf_1 = require("./middlewares/csrf");
mongoose_1.default.connect(config_1.default.DB_ADDRESS)
    .then(() => {
    console.log('Подключение к БД успешно установлено');
})
    .catch((error) => {
    console.error(`Не удалось подключиться к БД: ${error}`);
    process.exit(1);
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token'],
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.use((0, cookie_parser_1.default)());
// CSRF защита - выдаем токен
app.get('/csrf-token', csrf_1.csrfProtection, (req, res) => {
    var _a;
    res.json({ csrfToken: ((_a = req.csrfToken) === null || _a === void 0 ? void 0 : _a.call(req)) || '' });
});
app.use(csrf_1.csrfProtection);
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(logger_1.requestLogger);
app.use(rateLimiter_1.apiLimiter);
app.use(csrf_1.verifyCsrf);
app.use(productRoutes_1.default);
app.use(orderRoutes_1.default);
app.use(authRoutes_1.default);
app.use(uploadRoutes_1.default);
app.use(logger_1.errorLogger);
app.use((0, celebrate_1.errors)());
app.use(errorHandler_1.default);
app.listen(config_1.default.PORT, () => {
    console.log(`Сервер запущен, порт ${config_1.default.PORT}`);
});
