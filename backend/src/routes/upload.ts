import { Router } from 'express';
import { uploadFile } from '../controllers/upload';
import auth from '../middlewares/auth';
import fileMiddleware from '../middlewares/file';

const router = Router();

router.post('/', auth, fileMiddleware.single('file'), uploadFile);

export default router;
