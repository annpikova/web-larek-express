import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  createProduct, getAllProducts, updateProduct, deleteProduct,
} from '../controllers/productController';
// import auth from '../middlewares/auth';

const router = Router();

// Валидация для создания товара
const createProductValidation = celebrate({
  body: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object().keys({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required(),
    description: Joi.string(),
    price: Joi.number().min(0),
  }),
});

// Валидация для обновления товара
const updateProductValidation = celebrate({
  body: Joi.object().keys({
    title: Joi.string().min(2).max(30),
    image: Joi.object().keys({
      fileName: Joi.string(),
      originalName: Joi.string(),
    }),
    category: Joi.string(),
    description: Joi.string(),
    price: Joi.number().min(0),
  }),
  params: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
});

// Валидация для удаления товара
const deleteProductValidation = celebrate({
  params: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
});

router.get('/product', getAllProducts);
router.post('/product', createProductValidation, createProduct);
router.patch('/product/:productId', updateProductValidation, updateProduct);
router.delete('/product/:productId', deleteProductValidation, deleteProduct);

export default router;
