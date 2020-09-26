import express from 'express';
import RoleController from '../controllers/RoleController';
import authMiddleware from '../middlewares/auth';

const roleRouter = express.Router();

roleRouter.use(authMiddleware);
roleRouter.get('/', RoleController.get);
roleRouter.get('/:id', RoleController.getById);
roleRouter.post('/', RoleController.create);
roleRouter.put('/', RoleController.update);
roleRouter.delete('/:id', RoleController.delete);

export default roleRouter;
