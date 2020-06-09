import express from 'express';
import UserController from './controllers/UserController';

const routes = express.Router();
const userController = new UserController();

routes.get('/users', userController.index);

export default routes;
