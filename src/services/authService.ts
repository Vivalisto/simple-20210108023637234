import bcrypt from 'bcryptjs';

import UserService from '../services/userService';
import AppError from '../errors/AppError';

import RuleService from './ruleService';

class AuthService {
  async register(userRequest: any) {
    const userExist = await UserService.userExist(userRequest.email);

    if (userExist) {
      throw new AppError('Usuário já cadastrado no sistema');
    }

    return await UserService.create(userRequest);
  }

  async authenticate(email: string, password: string) {
    const userAuth: any = await UserService.userExist(email, true);

    if (!userAuth) {
      throw new AppError('usuário não cadastrado');
    }

    const validPassword = await bcrypt.compare(password, userAuth.password);

    if (!validPassword) {
      throw new AppError('Senha inválida');
    }

    const rule = userAuth?._doc?.rules;

    const rules = await RuleService.getByGroupProfile(rule.group, rule.profile);

    const token = await UserService.generateToken(userAuth);

    return {
      user: {
        ...userAuth?._doc,
        password: '******',
        rules: rules
          ? rules
          : {
              group: rule.group,
              profile: rule.profile,
              message: 'Regras não definidas para grupo e perfil',
            },
      },
      token,
    };
  }
}

export default new AuthService();
