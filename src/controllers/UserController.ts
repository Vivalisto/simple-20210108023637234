import { Request, Response, response } from 'express';
import UserModel from '../models/UserModel';

class UserController {
  async create(req: Request, res: Response) {
    const user = new UserModel(req.body);
    console.log(user);
    await user
      .save()
      .then((response) => {
        console.log('20000');
        return res.status(200).json(response);
      })
      .catch((error) => {
        console.log('errr');
        return res.status(500).json(error);
      });

    return res.status(200).json({ user: 'washington' });
  }
}

export default new UserController();
