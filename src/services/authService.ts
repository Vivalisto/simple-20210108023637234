import bcrypt from 'bcryptjs';

import UserService from '../services/userService';
import AppError from '../errors/AppError';

import RuleService from './ruleService';

import { UserSituation } from '../enums/user-situation.enum';
import { GroupType, ProfileType } from '../enums/access-control.enum';

class AuthService {
  async register(userRequest: any) {
    let userRule = {};

    if (userRequest.isOrganization) {
      userRule = {
        ...userRequest,
        rules: { group: GroupType.Imobiliaria, profile: ProfileType.Master },
      };
    } else {
      userRule = {
        ...userRequest,
        rules: { group: GroupType.Autonomo, profile: ProfileType.Master },
      };
    }

    return await UserService.create(userRule);
  }

  async registerInvite(userRequest: any, owner: string) {
    let userIvite = { ...userRequest, owner, password: '12345' };
    const newUser = await UserService.create(userIvite);

    if (newUser) {
      await UserService.sendInvite(userIvite.email);
    }
    return newUser;
  }

  async authenticate(email: string, password: string) {
    const userAuth: any = await UserService.userExist(email, true);

    if (!userAuth) {
      throw new AppError('usuário não cadastrado');
    }

    if (userAuth.situation === UserSituation.Inativo) {
      throw new AppError(
        'Usuário inátivo, favor entre em contato com seu superior',
        401
      );
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
