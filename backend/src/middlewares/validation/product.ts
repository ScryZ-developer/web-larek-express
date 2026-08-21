import { Joi, Segments } from 'celebrate';

export const createProductValidator = {
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required(),
    description: Joi.string().optional(),
    price: Joi.number().allow(null).optional(),
  }),
};

export const updateProductValidator = {
  [Segments.PARAMS]: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).optional(),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).optional(),
    category: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().allow(null).optional(),
  }).min(1),
};

export const productIdValidator = {
  [Segments.PARAMS]: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
};
