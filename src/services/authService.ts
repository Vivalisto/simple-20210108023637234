import bcrypt from 'bcryptjs';

import UserService from '../services/userService';
import AppError from '../errors/AppError';

class AuthService {
  async register(userRequest: any) {
    const userExist = await UserService.userExist(userRequest.email);

    if (userExist) {
      throw new AppError('Usuário já cadastrado no sistema');
    }

    return await UserService.create(userRequest);
  }

  async authenticate(email: string, password: string) {
    const user: any = await UserService.userExist(email, true);

    if (!user) {
      throw new AppError('usuário não cadastrado');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new AppError('Senha inválida');
    }

    const token = await UserService.generateToken(user);

    return { user, token };
  }
}

export default new AuthService();
