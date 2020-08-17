import express from 'express';
import StageController from '../controllers/StageController';
import authMiddleware from '../middlewares/auth';

const stageRouter = express.Router();

stageRouter.use(authMiddleware);
stageRouter.get('/', StageController.get);
stageRouter.get('/:id', StageController.getById);
stageRouter.post('/', StageController.create);
stageRouter.put('/', StageController.update);
stageRouter.delete('/:id', StageController.delete);

export default stageRouter;
