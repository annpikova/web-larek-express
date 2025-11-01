"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    PORT: process.env.PORT || 3000,
    DB_ADDRESS: process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    AUTH_ACCESS_TOKEN_EXPIRY: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
    AUTH_REFRESH_TOKEN_EXPIRY: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
    UPLOAD_TEMP_DIR: process.env.UPLOAD_TEMP_DIR || 'temp',
    UPLOAD_FINAL_DIR: process.env.UPLOAD_FINAL_DIR || 'public/images',
};
exports.default = config;
