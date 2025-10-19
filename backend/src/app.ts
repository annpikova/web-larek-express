// import './types/express';
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/errorHandler';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { config } from './config';
import { errorLogger, requestLogger } from './middlewares/logger';

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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);

app.use(productRoutes);
app.use(orderRoutes);
app.use(authRoutes);
app.use(uploadRoutes);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Сервер запущен, порт ${config.PORT}`);
});
