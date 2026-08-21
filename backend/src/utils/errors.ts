import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

export const mapDbError = (err: unknown, conflictMessage = 'Конфликт данных') => {
  if (err instanceof MongooseError.ValidationError) {
    return new BadRequestError(err.message);
  }

  if (err instanceof MongooseError.CastError) {
    return new BadRequestError('Передан некорректный идентификатор');
  }

  if (err instanceof Error && err.message.includes('E11000')) {
    return new ConflictError(conflictMessage);
  }

  return err;
};
