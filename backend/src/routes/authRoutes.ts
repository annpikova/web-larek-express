import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  register, login, refreshAccessToken, logout, getCurrentUser,
} from '../controllers/authController';
import auth from '../middlewares/auth';

const router = Router();

// Валидация для регистрации
const registerValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

// Валидация для входа
const loginValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

router.post('/auth/register', registerValidation, register);
router.post('/auth/login', loginValidation, login);
router.get('/auth/token', refreshAccessToken);
router.get('/auth/logout', logout);
router.get('/auth/user', auth, getCurrentUser);

export default router;
