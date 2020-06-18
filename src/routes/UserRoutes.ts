import express from 'express';
import UserController from '../controllers/UserController';

const userRouter = express.Router();

userRouter.get('/test', (req, res) => res.json({ msg: 'server ativo' }));

userRouter.get('/', UserController.get);
userRouter.get('/:id', UserController.getById);
userRouter.post('/', UserController.get);
userRouter.put('/:id', UserController.get);
userRouter.delete('/:id', UserController.get);

export default userRouter;
