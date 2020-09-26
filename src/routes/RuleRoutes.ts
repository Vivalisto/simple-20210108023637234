import express from 'express';
import RuleController from '../controllers/RuleController';
import authMiddleware from '../middlewares/auth';

const ruleRouter = express.Router();

ruleRouter.use(authMiddleware);
ruleRouter.get('/', RuleController.get);
ruleRouter.get('/:id', RuleController.getById);
ruleRouter.post('/', RuleController.create);
ruleRouter.put('/', RuleController.update);
ruleRouter.delete('/:id', RuleController.delete);

export default ruleRouter;
