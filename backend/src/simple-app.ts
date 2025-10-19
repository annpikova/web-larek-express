import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import config from './config';

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

// Простой тестовый роут
app.get('/product', (req, res) => {
  res.json({
    items: [],
    total: 0,
  });
});

app.listen(config.PORT, () => {
  console.log(`Сервер запущен, порт ${config.PORT}`);
});
