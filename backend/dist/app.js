"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import './types/express';
const express_1 = __importDefault(require("express"));
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
const config_1 = require("./config");
const logger_1 = require("./middlewares/logger");
mongoose_1.default.connect(config_1.config.DB_ADDRESS)
    .then(() => {
    console.log('Подключение к БД успешно установлено');
})
    .catch((error) => {
    console.error(`Не удалось подключиться к БД: ${error}`);
    process.exit(1);
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.use(logger_1.requestLogger);
app.use(productRoutes_1.default);
app.use(orderRoutes_1.default);
app.use(authRoutes_1.default);
app.use(uploadRoutes_1.default);
app.use(logger_1.errorLogger);
app.use((0, celebrate_1.errors)());
app.use(errorHandler_1.default);
app.listen(config_1.config.PORT, () => {
    console.log(`Сервер запущен, порт ${config_1.config.PORT}`);
});
