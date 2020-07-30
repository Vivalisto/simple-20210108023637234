import express from 'express';
import AuthController from '../controllers/AuthController';

const authRouter = express.Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/authenticate', AuthController.authenticate);
authRouter.put('/forgot-password', AuthController.forgotPassword);

export default authRouter;
