"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const express_winston_1 = __importDefault(require("express-winston"));
exports.requestLogger = express_winston_1.default.logger({
    transports: [
        new winston_1.default.transports.File({ filename: 'request.log' }),
    ],
    format: winston_1.default.format.json(),
});
exports.errorLogger = express_winston_1.default.errorLogger({
    transports: [
        new winston_1.default.transports.File({ filename: 'error.log' }),
    ],
    format: winston_1.default.format.json(),
});
