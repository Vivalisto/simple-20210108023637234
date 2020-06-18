import express from 'express';
import UserController from '../controllers/UserController';

const userRouter = express.Router();

userRouter.get('/test', (req, res) => res.json({ msg: 'server ativo' }));

userRouter.get('/', UserController.get);
userRouter.get('/:id', UserController.getById);
userRouter.post('/', UserController.create);
userRouter.put('/:id', UserController.update);
userRouter.delete('/:id', UserController.delete);

export default userRouter;
