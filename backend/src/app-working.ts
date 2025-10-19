import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import { config } from './config';

mongoose.connect(config.DB_ADDRESS)
  .then(() => {
    console.log('Подключение к БД успешно установлено');
  })
  .catch((error) => {
    console.error(`Не удалось подключиться к БД: ${error}`);
    process.exit(1);
  });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница
app.get('/', (req, res) => {
  res.json({
    message: 'Web-ларёк API работает!',
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

app.listen(config.PORT, () => {
  console.log(`Сервер запущен на http://localhost:${config.PORT}`);
  console.log(`API доступно по адресу: http://localhost:${config.PORT}`);
});
