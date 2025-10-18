"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../constants");
const productSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, constants_1.ERROR_MESSAGES.PRODUCT_TITLE_REQUIRED],
        minlength: [2, constants_1.ERROR_MESSAGES.PRODUCT_TITLE_MIN_LENGTH],
        maxlength: [30, constants_1.ERROR_MESSAGES.PRODUCT_TITLE_MAX_LENGTH],
        unique: true,
    },
    image: {
        fileName: {
            type: String,
            required: [true, constants_1.ERROR_MESSAGES.PRODUCT_IMAGE_FILE_NAME_REQUIRED],
        },
        originalName: {
            type: String,
            required: [true, constants_1.ERROR_MESSAGES.PRODUCT_IMAGE_ORIGINAL_NAME_REQUIRED],
        },
    },
    category: {
        type: String,
        required: [true, 'Поле "category" должно быть заполнено'],
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        min: [0, constants_1.ERROR_MESSAGES.PRODUCT_PRICE_NEGATIVE],
        default: null,
    },
});
// Триггер для удаления файлов при удалении товара
productSchema.post('findOneAndDelete', (doc) => __awaiter(void 0, void 0, void 0, function* () {
    if (doc && doc.image && doc.image.fileName) {
        const rel = doc.image.fileName.replace(/^\//, '');
        const filePath = path_1.default.join(process.cwd(), 'public', rel);
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.error('Ошибка при удалении файла:', error);
        }
    }
}));
exports.default = (0, mongoose_1.model)('product', productSchema);
