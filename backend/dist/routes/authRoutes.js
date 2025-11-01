"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const celebrate_1 = require("celebrate");
const authController_1 = require("../controllers/authController");
const auth_1 = __importDefault(require("../middlewares/auth"));
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Валидация для регистрации
const registerValidation = (0, celebrate_1.celebrate)({
    body: celebrate_1.Joi.object().keys({
        name: celebrate_1.Joi.string().min(2).max(30),
        email: celebrate_1.Joi.string().email().required(),
        password: celebrate_1.Joi.string().min(6).required(),
    }),
});
// Валидация для входа
const loginValidation = (0, celebrate_1.celebrate)({
    body: celebrate_1.Joi.object().keys({
        email: celebrate_1.Joi.string().email().required(),
        password: celebrate_1.Joi.string().required(),
    }),
});
router.post('/auth/register', rateLimiter_1.authLimiter, registerValidation, authController_1.register);
router.post('/auth/login', rateLimiter_1.authLimiter, loginValidation, authController_1.login);
router.post('/auth/token', rateLimiter_1.authLimiter, authController_1.refreshAccessToken);
router.post('/auth/logout', rateLimiter_1.authLimiter, authController_1.logout);
router.get('/auth/user', auth_1.default, authController_1.getCurrentUser);
exports.default = router;
