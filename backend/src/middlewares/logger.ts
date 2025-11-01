import winston from 'winston';
import expressWinston from 'express-winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const requestLogRotateTransport = new DailyRotateFile({
  filename: 'request-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
});

const errorLogRotateTransport = new DailyRotateFile({
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
});

export const requestLogger = expressWinston.logger({
  transports: [
    requestLogRotateTransport,
  ],
  format: winston.format.json(),
});

export const errorLogger = expressWinston.errorLogger({
  transports: [
    errorLogRotateTransport,
  ],
  format: winston.format.json(),
});
