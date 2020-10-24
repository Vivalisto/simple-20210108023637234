import express from 'express';
import TermController from '../controllers/TermController';
import authMiddleware from '../middlewares/auth';

const termRouter = express.Router();

termRouter.use(authMiddleware);
termRouter.get('/', TermController.get);
termRouter.get('/:id', TermController.getById);
termRouter.post('/', TermController.create);
termRouter.put('/', TermController.update);
termRouter.delete('/:id', TermController.delete);

export default termRouter;
