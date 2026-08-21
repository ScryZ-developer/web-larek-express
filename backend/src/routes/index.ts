import { Router } from 'express';
import productRouter from './product';
import orderRouter from './order';
import authRouter from './auth';
import uploadRouter from './upload';

const router = Router();

router.use('/product', productRouter);
router.use('/order', orderRouter);
router.use('/auth', authRouter);
router.use('/upload', uploadRouter);

export default router;
