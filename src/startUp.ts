import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import DataBase from './config/database';
import userRouter from './routes/UserRoutes';
import authRouter from './routes/AuthRoutes';
import proposalRoutes from './routes/ProposalRoutes';
import stageRouter from './routes/StageRoutes';
import ruleRouter from './routes/RuleRoutes';
import customerRouter from './routes/CustomerRoutes';
import authMiddleware from './middlewares/auth';

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
    // this.enableCors();
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  routes() {
    this.app.use('/api/v1/auth', authRouter);
    this.app.use('/api/v1/users', userRouter);
    this.app.use('/api/v1/proposals', proposalRoutes);
    this.app.use('/api/v1/stage', stageRouter);
    this.app.use('/api/v1/rule', ruleRouter);
    this.app.use('/api/v1/customer', customerRouter);

    this.app.route('/').get((req: Request, res: Response) => {
      return res.send({ versao: '0.0.1' });
    });
  }
}

export default new StartUp();
