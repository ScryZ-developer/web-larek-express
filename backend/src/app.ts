import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { errors } from 'celebrate';
import {
  DB_ADDRESS, PORT, ORIGIN_ALLOW, UPLOAD_PATH, UPLOAD_PATH_TEMP,
} from './config';
import routes from './routes';
import { requestLogger, errorLogger } from './middlewares/logger';
import errorHandler from './middlewares/error-handler';
import NotFoundError from './errors/not-found-error';
import initCron from './utils/cron';
import { getTempPath, getImagesPath } from './utils/file';

const app = express();

const publicDir = path.join(__dirname, 'public');

[UPLOAD_PATH_TEMP, UPLOAD_PATH].forEach((dir) => {
  const dirPath = path.join(publicDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

getTempPath();
getImagesPath();

app.use(cors({
  origin: ORIGIN_ALLOW,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(express.static(publicDir));
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use((_req, _res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});
app.use(errorHandler);

mongoose.connect(DB_ADDRESS)
  .then(() => {
    console.log('Подключение к базе данных установлено');
    initCron();
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Ошибка подключения к базе данных:', err);
  });

export default app;
