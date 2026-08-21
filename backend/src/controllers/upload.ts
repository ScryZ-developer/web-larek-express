import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/bad-request-error';
import { UPLOAD_PATH } from '../config';

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new BadRequestError('Файл не передан'));
  }

  return res.status(200).json({
    fileName: `/${UPLOAD_PATH}/${req.file.filename}`,
    originalName: req.file.originalname,
  });
};
