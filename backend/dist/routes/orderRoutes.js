"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const celebrate_1 = require("celebrate");
const orderController_1 = __importDefault(require("../controllers/orderController"));
const router = (0, express_1.Router)();
// Валидация для создания заказа
const createOrderValidation = (0, celebrate_1.celebrate)({
    body: celebrate_1.Joi.object().keys({
        payment: celebrate_1.Joi.string().valid('card', 'online').required(),
        email: celebrate_1.Joi.string().email().required(),
        phone: celebrate_1.Joi.string().required(),
        address: celebrate_1.Joi.string().required(),
        total: celebrate_1.Joi.number().min(0).required(),
        items: celebrate_1.Joi.array().items(celebrate_1.Joi.string().hex().length(24)).min(1).required(),
    }),
});
router.post('/order', createOrderValidation, orderController_1.default);
exports.default = router;
