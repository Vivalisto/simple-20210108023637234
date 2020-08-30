import express from 'express';
import ProposalController from '../controllers/ProposalController';
import authMiddleware from '../middlewares/auth';

const proposalRouter = express.Router();

proposalRouter.use(authMiddleware);

proposalRouter.get('/signings', ProposalController.getSignings);
proposalRouter.get('/', ProposalController.get);
proposalRouter.get('/:id', ProposalController.getById);

proposalRouter.post('/', ProposalController.create);

proposalRouter.put('/', ProposalController.update);
proposalRouter.put('/:id/status', ProposalController.updateStatus);
// proposalRouter.delete('/:id', ProposalController.delete);

export default proposalRouter;
