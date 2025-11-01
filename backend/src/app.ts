import express, { Request, Response } from 'express';
import './types/express';
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
import config from './config';
import { errorLogger, requestLogger } from './middlewares/logger';
import { apiLimiter } from './middlewares/rateLimiter';
import { csrfProtection, verifyCsrf } from './middlewares/csrf';

mongoose.connect(config.DB_ADDRESS)
  .then(() => {
    console.log('Подключение к БД успешно установлено');
  })
  .catch((error) => {
    console.error(`Не удалось подключиться к БД: ${error}`);
    process.exit(1);
  });

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// CSRF защита - выдаем токен
app.get('/csrf-token', csrfProtection, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken?.() || '' });
});

app.use(csrfProtection);
app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);
app.use(apiLimiter);
app.use(verifyCsrf);

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
