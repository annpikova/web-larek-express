"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
// Подключение к MongoDB
mongoose_1.default.connect(config_1.config.DB_ADDRESS)
    .then(() => {
    console.log('Подключение к БД успешно установлено');
})
    .catch((error) => {
    console.error(`Не удалось подключиться к БД: ${error}`);
    process.exit(1);
});
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Главная страница - исправляем проблему с "Cannot GET /"
app.get('/', (req, res) => {
    res.json({
        message: '🎉 Web-ларёк API работает!',
        status: 'success',
        timestamp: new Date().toISOString(),
        endpoints: {
            products: 'GET /product',
            orders: 'POST /order',
            auth: {
                register: 'POST /auth/register',
                login: 'POST /auth/login',
                user: 'GET /auth/user'
            }
        }
    });
});
// Товары
app.get('/product', (req, res) => {
    res.json({
        items: [],
        total: 0,
        message: 'Список товаров (пока пустой)'
    });
});
// Заказы
app.post('/order', (req, res) => {
    res.json({
        message: 'Заказ создан (заглушка)',
        id: 'demo-order-id'
    });
});
// Запуск сервера
const PORT = config_1.config.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📱 API доступно по адресу: http://localhost:${PORT}`);
    console.log(`🏠 Главная страница: http://localhost:${PORT}/`);
});
