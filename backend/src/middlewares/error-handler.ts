import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = statusCode === 500
    ? 'На сервере произошла ошибка'
    : err.message;

  return res.status(statusCode).json({ message });
};

export default errorHandler;
