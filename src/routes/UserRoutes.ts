import express from 'express';
import UserController from '../controllers/UserController';
import authMiddleware from '../middlewares/auth';

const userRouter = express.Router();

userRouter.get('/test', (req, res) => res.json({ msg: 'server ativo' }));

userRouter.use(authMiddleware);
userRouter.get('/', UserController.get);
userRouter.get('/:id', UserController.getById);
userRouter.post('/', UserController.create);
userRouter.put('/', UserController.update);
userRouter.put('/:id/situation', UserController.updateSituation);

userRouter.delete('/:id', UserController.delete);

export default userRouter;
