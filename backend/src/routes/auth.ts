import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  login,
  register,
  getCurrentUser,
  logout,
  refreshAccessToken,
} from '../controllers/auth';
import {
  loginValidator,
  registerValidator,
} from '../middlewares/validation/auth';
import auth from '../middlewares/auth';

const router = Router();

router.post('/login', celebrate(loginValidator), login);
router.post('/register', celebrate(registerValidator), register);
router.post('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
