"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const constants_1 = require("../constants");
const config_1 = __importDefault(require("../config"));
const uploadFile = (req, res, next) => {
    if (!req.file) {
        next(new Error('Файл не был загружен'));
        return;
    }
    const originalName = path_1.default.basename(req.file.originalname || '');
    const fileExtension = path_1.default.extname(originalName);
    const uniqueFileName = `${(0, crypto_1.randomUUID)()}${fileExtension}`;
    // Перемещаем файл из временной папки в постоянную с защитой от path traversal
    const tempDir = path_1.default.resolve(process.cwd(), config_1.default.UPLOAD_TEMP_DIR);
    const finalDir = path_1.default.resolve(process.cwd(), config_1.default.UPLOAD_FINAL_DIR);
    const tempPath = path_1.default.join(tempDir, req.file.filename);
    const finalPath = path_1.default.join(finalDir, uniqueFileName);
    // Проверка на выход за пределы директории
    if (!finalPath.startsWith(finalDir)) {
        next(new Error('Неверное имя файла'));
        return;
    }
    try {
        // Создаем директорию, если её нет
        if (!fs_1.default.existsSync(finalDir)) {
            fs_1.default.mkdirSync(finalDir, { recursive: true });
        }
        if (fs_1.default.existsSync(tempPath)) {
            fs_1.default.copyFileSync(tempPath, finalPath);
            fs_1.default.unlinkSync(tempPath);
        }
    }
    catch (error) {
        next(new Error('Ошибка при сохранении файла'));
        return;
    }
    const publicPath = `/images/${uniqueFileName}`;
    res.status(constants_1.HTTP_STATUS.OK).json({
        fileName: publicPath,
        storedName: uniqueFileName,
        originalName,
    });
};
exports.default = uploadFile;
