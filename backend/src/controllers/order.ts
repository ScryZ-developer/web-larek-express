import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

export const createOrder = (req: Request, res: Response, next: NextFunction) => {
  const { items, total } = req.body;

  Product.find({ _id: { $in: items } })
    .then((products) => {
      if (products.length !== items.length) {
        throw new BadRequestError('Один или несколько товаров не найдены');
      }

      const unavailableProduct = products.find((product) => product.price === null);
      if (unavailableProduct) {
        throw new BadRequestError('Товар недоступен для покупки');
      }

      const calculatedTotal = products.reduce((sum, product) => sum + (product.price ?? 0), 0);
      if (calculatedTotal !== total) {
        throw new BadRequestError('Сумма заказа не совпадает с суммой товаров');
      }

      return res.status(200).json({
        id: faker.string.uuid(),
        total: calculatedTotal,
      });
    })
    .catch(next);
};
