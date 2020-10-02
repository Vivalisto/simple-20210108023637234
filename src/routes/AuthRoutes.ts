import express from 'express';
import AuthController from '../controllers/AuthController';
import authMiddleware from '../middlewares/auth';

const authRouter = express.Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/authenticate', AuthController.authenticate);
authRouter.post('/forgot-password', AuthController.forgotPassword);
authRouter.post('/reset-password', AuthController.resetPassword);

authRouter.use(authMiddleware);
authRouter.post('/invite', AuthController.invite);

export default authRouter;
