import express, { json } from 'express';
import UserRoutes from './routes/UserRoutes';

const server = express();
server.use(express.json());

server.use('/users', UserRoutes);

server.listen(3333, () => {
  console.log('api online!');
});
