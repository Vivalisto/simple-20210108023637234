import StartUp from './startUp';

let port = process.env.PORT || '3333';

StartUp.app.listen(port, () => {
  console.log(`😀 servidor executando na porta ${port}`);
});

// import express, { json } from 'express';
// import UserRoutes from './routes/UserRoutes';

// const server = express();
// server.use(express.json());

// server.use('/users', UserRoutes);

// server.listen(3333, () => {
//   console.log('api online!');
// });
