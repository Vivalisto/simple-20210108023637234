import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import UserService from '../services/userService';
import Helper from '../utils/helper';
class UserController {
  async get(req: Request, res: Response) {
    await UserService.get()
      .then((users) => {
        Helper.sendResponse(res, HttpStatus.OK, users);
      })
      .catch((error) => {
        console.error.bind(console, `Error ${error}`);
      });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    await UserService.getById(id)
      .then((users) => {
        Helper.sendResponse(res, HttpStatus.OK, users);
      })
      .catch((error) => {
        console.error.bind(console, `Error ${error}`);
      });
  }

  async create(req: Request, res: Response) {
    let user = req.body;

    await UserService.create(user)
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

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const userUpdate = req.body;

    await UserService.update(id, userUpdate)
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

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await UserService.delete(id)
      .then(() => {
        Helper.sendResponse(res, httpStatus.OK, 'Usuário deletado com sucesso');
      })
      .catch((error) => {
        console.error.bind(console, `Error ${error}`);
      });
  }
}

export default new UserController();
