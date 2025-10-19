"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const celebrate_1 = require("celebrate");
const productController_1 = require("../controllers/productController");
// import auth from '../middlewares/auth';
const router = (0, express_1.Router)();
// Валидация для создания товара
const createProductValidation = (0, celebrate_1.celebrate)({
    body: celebrate_1.Joi.object().keys({
        title: celebrate_1.Joi.string().min(2).max(30).required(),
        image: celebrate_1.Joi.object().keys({
            fileName: celebrate_1.Joi.string().required(),
            originalName: celebrate_1.Joi.string().required(),
        }).required(),
        category: celebrate_1.Joi.string().required(),
        description: celebrate_1.Joi.string(),
        price: celebrate_1.Joi.number().min(0),
    }),
});
// Валидация для обновления товара
const updateProductValidation = (0, celebrate_1.celebrate)({
    body: celebrate_1.Joi.object().keys({
        title: celebrate_1.Joi.string().min(2).max(30),
        image: celebrate_1.Joi.object().keys({
            fileName: celebrate_1.Joi.string(),
            originalName: celebrate_1.Joi.string(),
        }),
        category: celebrate_1.Joi.string(),
        description: celebrate_1.Joi.string(),
        price: celebrate_1.Joi.number().min(0),
    }),
    params: celebrate_1.Joi.object().keys({
        productId: celebrate_1.Joi.string().hex().length(24).required(),
    }),
});
// Валидация для удаления товара
const deleteProductValidation = (0, celebrate_1.celebrate)({
    params: celebrate_1.Joi.object().keys({
        productId: celebrate_1.Joi.string().hex().length(24).required(),
    }),
});
router.get('/product', productController_1.getAllProducts);
router.post('/product', createProductValidation, productController_1.createProduct);
router.patch('/product/:productId', updateProductValidation, productController_1.updateProduct);
router.delete('/product/:productId', deleteProductValidation, productController_1.deleteProduct);
exports.default = router;
