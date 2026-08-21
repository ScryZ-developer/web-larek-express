import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product';
import {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} from '../middlewares/validation/product';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, celebrate(createProductValidator), createProduct);
router.patch('/:productId', auth, celebrate(updateProductValidator), updateProduct);
router.delete('/:productId', auth, celebrate(productIdValidator), deleteProduct);

export default router;
