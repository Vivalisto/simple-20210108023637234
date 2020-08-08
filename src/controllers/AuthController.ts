import { Request, Response } from 'express';
import * as Yup from 'yup';
import httpStatus, * as HttpStatus from 'http-status';

import UserService from '../services/userService';
import Helper from '../utils/helper';
import {
  authenticateValidation,
  registerValidation,
} from '../validation/authValidation';
import { request } from 'http';
import AuthService from '../services/authService';

import AppError from '../errors/AppError';

const schema = Yup.object().shape({
  email: Yup.string().required().email(),
  password: Yup.string().required(),
});

class AuthController {
  async register(req: Request, res: Response) {
    const userRequest = req.body;

    try {
      await registerValidation(req.body);
      const user = await AuthService.register(userRequest);
      Helper.sendResponse(res, HttpStatus.OK, {
        message: 'Usuário cadastrado com sucesso',
      });
    } catch (error) {
      Helper.sendResponse(res, error.statusCode, error.message);
    }
  }

  async authenticate(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      await authenticateValidation(req.body);

      const auth = await AuthService.authenticate(email, password);

      Helper.sendResponse(res, HttpStatus.OK, auth);
    } catch (error) {
      Helper.sendResponse(res, error.statusCode, error.message);
    }
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    try {
      await UserService.forgotPassword(email);

      Helper.sendResponse(res, HttpStatus.OK, {
        message: `Link de alteração de senha enviado para o email ${email}.`,
      });
    } catch (error) {
      Helper.sendResponse(
        res,
        error.statusCode,
        error.message || 'Erro inesperado'
      );
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { email, password, token } = req.body;

    try {
      await UserService.resetPasswordByForgotPassword(email, password, token);

      Helper.sendResponse(res, HttpStatus.OK, {
        message: 'Senha alterada com sucesso',
      });
    } catch (error) {
      Helper.sendResponse(
        res,
        error.statusCode,
        error.message || 'Erro inesperado'
      );
    }
  }
}

export default new AuthController();
