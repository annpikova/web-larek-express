"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const express_winston_1 = __importDefault(require("express-winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const requestLogRotateTransport = new winston_daily_rotate_file_1.default({
    filename: 'request-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
});
const errorLogRotateTransport = new winston_daily_rotate_file_1.default({
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
});
exports.requestLogger = express_winston_1.default.logger({
    transports: [
        requestLogRotateTransport,
    ],
    format: winston_1.default.format.json(),
});
exports.errorLogger = express_winston_1.default.errorLogger({
    transports: [
        errorLogRotateTransport,
    ],
    format: winston_1.default.format.json(),
});
