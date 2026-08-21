import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product, { IProduct } from '../models/product';
import BadRequestError from '../errors/bad-request-error';

export const createOrder = (req: Request, res: Response, next: NextFunction) => {
  const { items, total } = req.body;

  Product.find({ _id: { $in: items } })
    .then((products) => {
      const productsById = new Map(
        products.map((product) => [product._id.toString(), product]),
      );

      const orderProducts: IProduct[] = items.map((id: string) => {
        const product = productsById.get(id);

        if (!product) {
          throw new BadRequestError('Один или несколько товаров не найдены');
        }

        return product;
      });

      const unavailableProduct = orderProducts.find((product) => product.price === null);
      if (unavailableProduct) {
        throw new BadRequestError('Товар недоступен для покупки');
      }

      const calculatedTotal = orderProducts.reduce(
        (sum, product) => sum + (product.price ?? 0),
        0,
      );

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
