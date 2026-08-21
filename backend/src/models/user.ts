import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

export interface IToken {
  token: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  tokens: IToken[];
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      minlength: [2, 'Минимальная длина поля "name" - 2'],
      maxlength: [30, 'Максимальная длина поля "name" - 30'],
      default: 'Ё-мое',
    },
    email: {
      type: String,
      required: [true, 'Поле "email" должно быть заполнено'],
      unique: true,
      validate: {
        validator: (v: string) => validator.isEmail(v),
        message: 'Некорректный формат email',
      },
    },
    password: {
      type: String,
      required: [true, 'Поле "password" должно быть заполнено'],
      minlength: [6, 'Минимальная длина поля "password" - 6'],
      select: false,
    },
    tokens: {
      type: [{ token: String }],
      select: false,
      default: [],
    },
  },
  { versionKey: false },
);

userSchema.pre('save', async function savePassword(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default model<IUser>('user', userSchema);
