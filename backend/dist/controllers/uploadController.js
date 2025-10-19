"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const constants_1 = require("../constants");
const uploadFile = (req, res, next) => {
    if (!req.file) {
        next(new Error('Файл не был загружен'));
        return;
    }
    const { originalname } = req.file;
    const fileExtension = path_1.default.extname(originalname);
    const uniqueFileName = `${(0, crypto_1.randomUUID)()}${fileExtension}`;
    res.status(constants_1.HTTP_STATUS.OK).json({
        fileName: `/images/${uniqueFileName}`,
        originalName: originalname,
    });
};
exports.default = uploadFile;
