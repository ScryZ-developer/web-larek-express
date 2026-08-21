import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';

const publicDir = path.join(__dirname, '..', 'public');
const tempDir = path.join(publicDir, UPLOAD_PATH_TEMP);
const imagesDir = path.join(publicDir, UPLOAD_PATH);

export const getTempPath = () => tempDir;

export const getImagesPath = () => imagesDir;

export const moveImageToPermanent = async (fileName: string) => {
  const basename = path.basename(fileName);
  const source = path.join(tempDir, basename);
  const destination = path.join(imagesDir, basename);
  await fs.rename(source, destination);
};

export const deleteImage = async (fileName: string) => {
  const basename = path.basename(fileName);
  const filePath = path.join(imagesDir, basename);

  try {
    await fs.unlink(filePath);
  } catch {
    // файл уже удалён или отсутствует
  }
};

export const cleanTempFolder = async () => {
  const files = await fs.readdir(tempDir);

  await Promise.all(
    files.map((file) => fs.unlink(path.join(tempDir, file))),
  );
};
