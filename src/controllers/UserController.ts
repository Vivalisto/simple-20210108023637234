import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import UserService from '../services/userService';
import Helper from '../utils/helper';
class UserController {
  async get(req: Request, res: Response) {
    try {
      const users = await UserService.get();
      Helper.sendResponse(res, HttpStatus.OK, users);
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const user = await UserService.getById(id);
      Helper.sendResponse(res, httpStatus.OK, user);
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async create(req: Request, res: Response) {
    const userRequest = req.body;
    const { email } = req.body;

    try {
      const user = await UserService.userExist(email);

      if (user) {
        Helper.sendResponse(res, HttpStatus.BAD_REQUEST, 'User already exists');
      }

      let response = await UserService.create(userRequest);
      Helper.sendResponse(res, HttpStatus.OK, 'Usuário cadastrado com sucesso');
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const userUpdate = req.body;

    try {
      const user = await UserService.update(id, userUpdate);
      Helper.sendResponse(res, HttpStatus.OK, user);
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await UserService.delete(id);
      Helper.sendResponse(res, httpStatus.OK, 'Usuário deletado com sucesso');
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }
}

export default new UserController();
