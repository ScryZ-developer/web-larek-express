import { ErrorRequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';
import { isCelebrateError } from 'celebrate';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';
import UnauthorizedError from '../errors/unauthorized-error';
import DefaultError from '../errors/default-error';

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (isCelebrateError(err)) {
    const message = err.details.get('body')?.message
      || err.details.get('params')?.message
      || err.details.get('headers')?.message
      || 'Ошибка валидации данных';
    return res.status(400).json({ message: message.replace(/"/g, '') });
  }

  if (err instanceof MongooseError.ValidationError) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof MongooseError.CastError) {
    return res.status(400).json({ message: 'Передан некорректный идентификатор' });
  }

  if (err instanceof Error && err.message.includes('E11000')) {
    if (err.message.includes('title')) {
      return res.status(409).json({ message: 'Товар с таким названием уже существует' });
    }
    if (err.message.includes('email')) {
      return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
    }
    return res.status(409).json({ message: 'Конфликт данных' });
  }

  if (err instanceof BadRequestError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof ConflictError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if ('statusCode' in err && typeof err.statusCode === 'number') {
    return res.status(err.statusCode).json({ message: err.message });
  }

  const defaultError = new DefaultError('На сервере произошла ошибка');
  return res.status(defaultError.statusCode).json({ message: defaultError.message });
};

export default errorHandler;
