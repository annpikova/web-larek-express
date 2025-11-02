import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import createOrder from '../controllers/orderController';

const router = Router();

// Валидация для создания заказа
const createOrderValidation = celebrate({
  body: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().min(0).required(),
    items: Joi.array().items(Joi.string().allow('')).required(),
  }),
});

router.post('/order', createOrderValidation, createOrder);

export default router;
