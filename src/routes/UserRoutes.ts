import express from 'express';
import UserController from '../controllers/UserController';

const router = express.Router();

router.post('/', UserController.create);
router.get('/test', (req, res) => res.json({ msg: 'server ativo' }));

export default router;
