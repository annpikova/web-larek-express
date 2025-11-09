"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getAllProducts = void 0;
const product_1 = __importDefault(require("../models/product"));
const constants_1 = require("../constants");
const ConflictError_1 = __importDefault(require("../errors/ConflictError"));
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const getAllProducts = (_req, res, next) => {
    product_1.default.find()
        .then((products) => {
        res.status(constants_1.HTTP_STATUS.OK)
            .json({
            items: products,
            total: products.length,
        });
    })
        .catch((error) => {
        next(error);
    });
};
exports.getAllProducts = getAllProducts;
const createProduct = (req, res, next) => {
    const { description, image, title, category, price, } = req.body;
    product_1.default.create({
        description,
        image,
        title,
        category,
        price,
    })
        .then((product) => {
        res.status(constants_1.HTTP_STATUS.CREATED)
            .json(product);
    })
        .catch((error) => {
        if (error instanceof Error && error.message.includes('E11000')) {
            return next(new ConflictError_1.default(constants_1.ERROR_MESSAGES.PRODUCT_DUPLICATE_TITLE));
        }
        if (error.name === 'ValidationError') {
            return next(new BadRequestError_1.default(constants_1.ERROR_MESSAGES.VALIDATION_ERROR));
        }
        return next(error);
    });
};
exports.createProduct = createProduct;
const updateProduct = (req, res, next) => {
    const { productId } = req.params;
    const updateData = req.body;
    product_1.default.findByIdAndUpdate(productId, updateData, { runValidators: true, new: true })
        .then((product) => {
        if (!product) {
            next(new NotFoundError_1.default('Товар не найден'));
            return;
        }
        res.status(constants_1.HTTP_STATUS.OK).json({ item: product });
    })
        .catch((error) => {
        if (error instanceof Error && error.message.includes('E11000')) {
            next(new ConflictError_1.default(constants_1.ERROR_MESSAGES.PRODUCT_DUPLICATE_TITLE));
            return;
        }
        next(error);
    });
};
exports.updateProduct = updateProduct;
const deleteProduct = (req, res, next) => {
    const { productId } = req.params;
    product_1.default.findByIdAndDelete(productId)
        .then((product) => {
        if (!product) {
            next(new NotFoundError_1.default('Товар не найден'));
            return;
        }
        res.status(constants_1.HTTP_STATUS.OK).json({ item: product });
    })
        .catch((error) => {
        next(error);
    });
};
exports.deleteProduct = deleteProduct;
