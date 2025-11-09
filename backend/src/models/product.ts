import { model, Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { ERROR_MESSAGES } from '../constants';

interface IProduct {
  title: string;
  image: {
    fileName: string;
    originalName: string;
  };
  category: string;
  description?: string;
  price?: number | null;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, ERROR_MESSAGES.PRODUCT_TITLE_REQUIRED],
      minlength: [2, ERROR_MESSAGES.PRODUCT_TITLE_MIN_LENGTH],
      maxlength: [30, ERROR_MESSAGES.PRODUCT_TITLE_MAX_LENGTH],
      unique: true,
    },
    image: {
      fileName: {
        type: String,
        required: [true, ERROR_MESSAGES.PRODUCT_IMAGE_FILE_NAME_REQUIRED],
      },
      originalName: {
        type: String,
        required: [true, ERROR_MESSAGES.PRODUCT_IMAGE_ORIGINAL_NAME_REQUIRED],
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
      min: [0, ERROR_MESSAGES.PRODUCT_PRICE_NEGATIVE],
      default: null,
    },
  },
);

// Триггер для удаления файлов при удалении товара
productSchema.post('findOneAndDelete', async (doc) => {
  if (doc && doc.image && doc.image.fileName) {
    const rel = doc.image.fileName.replace(/^\//, '');
    const filePath = path.join(process.cwd(), 'public', rel);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Ошибка при удалении файла - логируем в файл через winston
    }
  }
});

export default model('product', productSchema);
