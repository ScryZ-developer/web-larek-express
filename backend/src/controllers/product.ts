import { Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { moveImageToPermanent } from '../utils/file';

const prepareProductData = async (body: Request['body']) => {
  const productData = { ...body };

  if (productData.image?.fileName) {
    await moveImageToPermanent(productData.image.fileName);
  }

  return productData;
};

export const getProducts = (_req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products) => {
      res.status(200).json({ items: products, total: products.length });
    })
    .catch(next);
};

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  prepareProductData(req.body)
    .then((productData) => Product.create(productData))
    .then((product) => {
      res.status(201).json(product);
    })
    .catch((err) => {
      if (err instanceof Error && err.message.includes('E11000')) {
        return next(new ConflictError('Товар с таким названием уже существует'));
      }
      return next(err);
    });
};

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  prepareProductData(req.body)
    .then((productData) => Product.findByIdAndUpdate(req.params.productId, productData, {
      runValidators: true,
      new: true,
    })
      .orFail(() => new NotFoundError('Товар по указанному идентификатору не найден')))
    .then((product) => {
      res.status(200).json(product);
    })
    .catch((err) => {
      if (err instanceof Error && err.message.includes('E11000')) {
        return next(new ConflictError('Товар с таким названием уже существует'));
      }
      return next(err);
    });
};

export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  Product.findOneAndDelete({ _id: req.params.productId })
    .orFail(() => new NotFoundError('Товар по указанному идентификатору не найден'))
    .then((product) => {
      res.status(200).json(product);
    })
    .catch(next);
};
