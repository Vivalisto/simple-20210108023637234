import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as Yup from 'yup';
import httpStatus, * as HttpStatus from 'http-status';

import UserService from '../services/userService';
import Helper from '../utils/helper';
import { authenticateValidation } from '../validation/authValidation';
import { request } from 'http';
import userService from '../services/userService';

const schema = Yup.object().shape({
  email: Yup.string().required().email(),
  password: Yup.string().required(),
});

class AuthController {
  async register(req: Request, res: Response) {
    const userRequest = req.body;
    const { email } = req.body;

    try {
      const user = await UserService.userExist(email);

      if (user) {
        Helper.sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          'Usuário já possui cadastro'
        );
      }

      await UserService.create(userRequest);
      Helper.sendResponse(res, HttpStatus.OK, 'Usuário cadastrado com sucesso');
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async authenticate(req: Request, res: Response) {
    const { email, password } = req.body;

    await authenticateValidation(res, req.body);

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

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    try {
      await UserService.updatePasswordReset(email);

      Helper.sendResponse(res, HttpStatus.OK, {
        message: `Link de alteração de senha enviado para o email ${email}.`,
      });
    } catch (error) {
      Helper.sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        error.message || 'Erro inesperado'
      );
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { email, password, token } = req.body;

    try {
      await userService.resetPasswordByForgotPassword(email, password, token);

      Helper.sendResponse(res, HttpStatus.OK, {
        message: 'Senha alterada com sucesso',
      });
    } catch (error) {
      Helper.sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        error.message || 'Erro inesperado'
      );
    }
  }
}

export default new AuthController();
