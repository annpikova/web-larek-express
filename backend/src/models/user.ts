import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  tokens: Array<{ token: string }>;
}

const userSchema = new Schema<IUser>({
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
      validator: (v: string) => /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,10}$/.test(v),
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

export default mongoose.model<IUser>('user', userSchema);
