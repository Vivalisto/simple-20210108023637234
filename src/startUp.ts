import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import DataBase from './config/database';
import userRouter from './routes/UserRoutes';

class StartUp {
  public app: express.Application;
  private _dataBase: DataBase;

  constructor() {
    this.app = express();
    this._dataBase = new DataBase();
    this._dataBase.createConnection();
    this.middler();
    this.routes();
  }

  enableCors() {
    const options: cors.CorsOptions = {
      methods: 'GET, OPTIONS, PUT, POST, DELETE',
      origin: '*',
    };
  }

  middler() {
    this.enableCors();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  routes() {
    this.app.route('/').get((req: Request, res: Response) => {
      return res.send({ versao: '0.0.1' });
    });

    this.app.use('/api/v1/users', userRouter);
  }
}

export default new StartUp();
