import express from 'express';
import CustomerController from '../controllers/CustomerController';
import authMiddleware from '../middlewares/auth';

const customerRouter = express.Router();

customerRouter.use(authMiddleware);
customerRouter.get('/', CustomerController.get);
customerRouter.get('/:id', CustomerController.getById);
customerRouter.post('/', CustomerController.create);
customerRouter.put('/', CustomerController.update);
customerRouter.delete('/:id', CustomerController.delete);

export default customerRouter;
