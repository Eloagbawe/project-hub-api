import express from 'express';
import { getUsers } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.get('/', protect, getUsers);

export default userRouter;
