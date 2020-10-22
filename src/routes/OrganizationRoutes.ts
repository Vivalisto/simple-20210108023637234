import express from 'express';
import OrganizationController from '../controllers/OrganizationController';
import authMiddleware from '../middlewares/auth';

const organizationRouter = express.Router();

organizationRouter.use(authMiddleware);
organizationRouter.get('/', OrganizationController.get);
organizationRouter.get('/:id', OrganizationController.getById);
organizationRouter.post('/', OrganizationController.create);
organizationRouter.put('/:id', OrganizationController.update);

export default organizationRouter;
