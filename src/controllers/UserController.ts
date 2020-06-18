import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import UserService from '../services/userService';
import Helper from '../utils/helper';
class UserController {
  get(req: Request, res: Response) {
    UserService.get()
      .then((users) => {
        Helper.sendResponse(res, HttpStatus.OK, users);
      })
      .catch((error) => {
        console.error.bind(console, `Error ${error}`);
      });
  }

  getById(req: Request, res: Response) {
    const { id } = req.params;

    UserService.getById(id)
      .then((users) => {
        Helper.sendResponse(res, HttpStatus.OK, users);
      })
      .catch((error) => {
        console.error.bind(console, `Error ${error}`);
      });
  }

  create(req: Request, res: Response) {
    let user = req.body;

    UserService.create(user)
      .then((user) => {
        Helper.sendResponse(
          res,
          HttpStatus.OK,
          'Usuário cadastrado com sucesso'
        );
      })
      .catch((error) => {
        console.error.bind(console, `Error ${error}`);
      });
  }

  update(req: Request, res: Response) {
    const { id } = req.params;
    const userUpdate = req.body;

    UserService.update(id, userUpdate)
      .then((user) => {
        Helper.sendResponse(
          res,
          HttpStatus.OK,
          `Usuário atualizado com sucesso`
        );
      })
      .catch((error) => {
        console.error.bind(console, `Error ${error}`);
      });
  }

  delete(req: Request, res: Response) {
    const { id } = req.params;

    UserService.delete(id)
      .then(() => {
        Helper.sendResponse(res, httpStatus.OK, 'Usuário deletado com sucesso');
      })
      .catch((error) => {
        console.error.bind(console, `Error ${error}`);
      });
  }
}

export default new UserController();
