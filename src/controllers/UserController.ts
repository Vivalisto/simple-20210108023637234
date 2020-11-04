import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import UserService from '../services/userService';
import Helper from '../utils/helper';
class UserController {
  async get(req: Request | any, res: Response) {
    const userId = req.userId;
    try {
      const users = await UserService.get(userId);
      Helper.sendResponse(res, HttpStatus.OK, users);
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async getAll(req: Request | any, res: Response) {
    const userId = req.userId;
    try {
      const users = await UserService.getAll(userId);
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

  async getByProfile(req: Request | any, res: Response) {
    const userId = req.userId;
    const { profile } = req.body;

    try {
      const user = await UserService.getByProfile({ userId, profile });
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
      Helper.sendResponse(res, error.statusCode, error.message);
    }
  }

  async update(req: Request | any, res: Response) {
    const id = req.userId;
    const userUpdate = req.body;

    try {
      const user = await UserService.update(id, userUpdate);
      Helper.sendResponse(res, HttpStatus.OK, user);
    } catch (error) {
      Helper.sendResponse(res, error.statusCode, error.message);
    }
  }

  async edit(req: Request | any, res: Response) {
    const userId = req.userId;
    const { userEditId } = req.params;
    const dataUpdate = req.body;

    try {
      const user = await UserService.edit(userId, dataUpdate, userEditId);
      Helper.sendResponse(res, HttpStatus.OK, {user});
    } catch (error) {
      Helper.sendResponse(res, error.statusCode, error.message);
    }
  }

  async updateSituation(req: Request | any, res: Response) {
    const { id } = req.params;
    const userNewStatus = req.body.situation;

    try {
      const user = await UserService.updateSituation(id, userNewStatus);
      Helper.sendResponse(res, HttpStatus.OK, { user });
    } catch (error) {
      Helper.sendResponse(res, error.statusCode, error.message);
    }
  }

  async updateTerm(req: Request | any, res: Response) {
    const id = req.userId;
    const userAddTerm = req.body.term;

    try {
      const user = await UserService.updateTerm(id, userAddTerm);
      Helper.sendResponse(res, HttpStatus.OK, { user });
    } catch (error) {
      Helper.sendResponse(res, error.statusCode, error.message);
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await UserService.delete(id);
      Helper.sendResponse(res, httpStatus.OK, 'Usuário deletado com sucesso');
    } catch (error) {
      Helper.sendResponse(res, error.statusCode, error.message);
    }
  }
}

export default new UserController();
