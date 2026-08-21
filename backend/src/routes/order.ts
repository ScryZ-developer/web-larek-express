import { Router } from 'express';
import { celebrate } from 'celebrate';
import { createOrder } from '../controllers/order';
import { createOrderValidator } from '../middlewares/validation/order';

const router = Router();

router.post('/', celebrate(createOrderValidator), createOrder);

export default router;
