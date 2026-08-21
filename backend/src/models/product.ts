import { Schema, model, Document } from 'mongoose';
import { deleteImage } from '../utils/file';

export interface IProductImage {
  fileName: string;
  originalName: string;
}

export interface IProduct extends Document {
  title: string;
  image: IProductImage;
  category: string;
  description?: string;
  price: number | null;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      unique: true,
      required: [true, 'Поле "title" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "title" - 2'],
      maxlength: [30, 'Максимальная длина поля "title" - 30'],
    },
    image: {
      fileName: {
        type: String,
        required: [true, 'Поле "image.fileName" должно быть заполнено'],
      },
      originalName: {
        type: String,
        required: [true, 'Поле "image.originalName" должно быть заполнено'],
      },
    },
    category: {
      type: String,
      required: [true, 'Поле "category" должно быть заполнено'],
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      default: null,
    },
  },
  { versionKey: false },
);

productSchema.post('findOneAndDelete', (doc) => {
  if (doc?.image?.fileName) {
    deleteImage(doc.image.fileName).catch(() => {});
  }
});

export default model<IProduct>('product', productSchema);
