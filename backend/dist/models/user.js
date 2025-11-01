"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        default: 'Ё-мое',
        minlength: [2, 'Минимальная длина поля "name" - 2'],
        maxlength: [30, 'Максимальная длина поля "name" - 30'],
    },
    email: {
        type: String,
        required: [true, 'Поле "email" должно быть заполнено'],
        unique: true,
        validate: {
            validator: (v) => /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,10}$/.test(v),
            message: 'Некорректный формат email',
        },
    },
    password: {
        type: String,
        required: [true, 'Поле "password" должно быть заполнено'],
        minlength: [6, 'Минимальная длина поля "password" - 6'],
        select: false,
    },
    tokens: [{
            token: {
                type: String,
                required: true,
            },
        }],
});
userSchema.path('tokens').select(false);
exports.default = mongoose_1.default.model('user', userSchema);
