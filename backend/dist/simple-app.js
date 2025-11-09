"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
mongoose_1.default.connect(config_1.default.DB_ADDRESS)
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
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Простой тестовый роут
app.get('/product', (req, res) => {
    res.json({
        items: [],
        total: 0,
    });
});
app.listen(config_1.default.PORT, () => {
    console.log(`Сервер запущен, порт ${config_1.default.PORT}`);
});
