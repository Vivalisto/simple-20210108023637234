import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import httpStatus, * as HttpStatus from 'http-status';
import jwt from 'jsonwebtoken';

import UserService from '../services/userService';
import Helper from '../utils/helper';

class AuthController {
  async register(req: Request, res: Response) {
    const userRequest = req.body;
    const { email } = req.body;

    try {
      const user = await UserService.userExist(email);

      if (user) {
        Helper.sendResponse(res, HttpStatus.BAD_REQUEST, 'User already exists');
      }

      await UserService.create(userRequest);
      Helper.sendResponse(res, HttpStatus.OK, 'Usuário cadastrado com sucesso');
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async authenticate(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user: any = await UserService.userExist(email, true);

      if (!user) {
        Helper.sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          'Usuário não encontrado'
        );
      }
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        Helper.sendResponse(res, HttpStatus.BAD_REQUEST, 'Senha inválida');
      }
      user.password = undefined;

      const token = await UserService.generateToken(user);
      Helper.sendResponse(res, HttpStatus.OK, { user, token });
    } catch (error) {
      Helper.sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Erro na autenticação'
      );
    }
  }
}

export default new AuthController();
