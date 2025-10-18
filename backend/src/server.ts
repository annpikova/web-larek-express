import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import { config } from './config';

// Подключение к MongoDB
mongoose.connect(config.DB_ADDRESS)
  .then(() => {
    console.log('Подключение к БД успешно установлено');
  })
  .catch((error) => {
    console.error(`Не удалось подключиться к БД: ${error}`);
    process.exit(1);
  });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

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
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📱 API доступно по адресу: http://localhost:${PORT}`);
  console.log(`🏠 Главная страница: http://localhost:${PORT}/`);
});
