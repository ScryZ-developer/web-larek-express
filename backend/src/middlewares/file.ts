import multer from 'multer';
import path from 'path';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { getTempPath } from '../utils/file';
import BadRequestError from '../errors/bad-request-error';

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, getTempPath());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = randomBytes(4).toString('hex');
    cb(null, `${uniqueName}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new BadRequestError('Недопустимый тип файла'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024,
  },
});

const fileMiddleware = {
  single: (fieldName: string) => (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return next(new BadRequestError(err.message));
      }

      if (err) {
        return next(err);
      }

      return next();
    });
  },
};

export default fileMiddleware;
