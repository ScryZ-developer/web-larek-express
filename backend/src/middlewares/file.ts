import multer from 'multer';
import path from 'path';
import { randomBytes } from 'crypto';
import { getTempPath } from '../utils/file';

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

  cb(new Error('Недопустимый тип файла'));
};

const fileMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024,
  },
});

export default fileMiddleware;
