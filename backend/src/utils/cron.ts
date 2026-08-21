import cron from 'node-cron';
import { cleanTempFolder } from './file';

const initCron = () => {
  cron.schedule('0 * * * *', () => {
    cleanTempFolder().catch((err) => {
      console.error('Ошибка очистки временной папки:', err);
    });
  });
};

export default initCron;
