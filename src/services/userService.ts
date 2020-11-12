import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as mongoose from 'mongoose';

import UserRepository from '../repositories/userRepository';
import OrganizationService from '../services/organizationService';
import keys from '../config/keys-dev';
import Mail from '../services/emailService';

import AppError from '../errors/AppError';

import { apiServer } from '../config/api';
import { sendMailUtil } from '../utils/sendMail';
import { GroupType, ProfileType } from '../enums/access-control.enum';
import { UserSituation } from '../enums/user-situation.enum';
import { TermKey } from '../enums/term-key.enum';
import proposalService from './proposalService';

class UserService {
  async get(userId: string) {
    let query: any;
    const userData: any = await this.getById(userId);

    if ( userData?.rules?.group === GroupType.Vivalisto ) {
      query = {};
    } else if (userData?.rules?.profile === ProfileType.Master) {
      query = { organization: userData.organization };
    } else if (userData?.rules?.profile === ProfileType.Gerente) {
      query = { owner: userData._id };
    } else {
      query = { userId };
    }

    return await UserRepository.find(query).select('-avatar');
  }

  async getAll(proposalId: string) {
    let query: any;
    const proposal: any = await proposalService.getById(proposalId)
    const userData: any = await this.getById(proposal?.user);

    if(userData?.organization) {
      query = { organization: userData.organization };
    } else {
      query = { _id: userData.id };
    }

    return await UserRepository.find(query).select('-avatar');
  }

  async getFiltered(query: {}) {
    return await UserRepository.find(query).select('-avatar');
  }

  async getById(_id: string | mongoose.Schema.Types.ObjectId) {
    return await UserRepository.findById(_id);
  }

  async create(user: any) {
    let userAux: any;
    const userExist = await this.userExist(user.email);
    let organization: any;

    if (userExist) {
      throw new AppError('Usuário já cadastrado no sistema');
    }

    if (user.isOrganization) {
      const organizationExist = await OrganizationService.exist(
        user.organization.document
      );

      if (organizationExist) {
        throw new AppError('Imobiliária já cadastrada no sistema');
      }

      organization = await OrganizationService.create(user.organization);
      userAux = {
        ...user,
        organization: organization.id,
      };
    } else {
      userAux = user;
    }

    return await UserRepository.create(userAux).catch((error) => {
      console.log(error);
      throw new AppError('Erro no cadastro, verifique seus dados');
    });
  }

  async createInvite(user: any) {
    const userExist = await this.userExist(user.email);

    if (userExist) {
      throw new AppError('Usuário já cadastrado no sistema');
    }

    return await UserRepository.create(user).catch((error) => {
      console.log(error);
      throw new AppError('Erro no cadastro, verifique seus dados');
    });
  }

  async update(_id: string, user: any) {
    return await UserRepository.findByIdAndUpdate(_id, user, { new: true });
  }

  async edit(userId: string, data: any, userEditId: string) {
    //carrega os dados do usuário que solicitou a alteração
    const userDb: any = await this.getById(userId);
    const userEdit: any = await this.getById(userEditId);

    const userDataByEmail: any = await this.userExist(data.email)

    const usersOwner: any = await this.getFiltered({owner: userEditId })
    const usersCoordinator: any = await this.getFiltered({coordinator: userEditId })

    if(userDataByEmail.id != userEditId) {
      throw new AppError('Email já cadastrado no sistema');
    }

    if (userDb?.rules?.profile !== ProfileType.Master) {
      throw new AppError('Usuário não tem permissão para realizar essa ação');
    }

    if(usersOwner?.length || usersCoordinator?.length) {
      if(userEdit.rules.profile === data.rules.profile ) {
        return await UserRepository.findByIdAndUpdate(userEditId, data, { new: true });
      } else {
        throw new AppError('Alteração de PERFIL não permitida. Existe(m) usuário(s) subordinado(s) a essa conta. Mova o(s) para outra gerencia  antes de realizar essa ação.');
      }
    }      
    return await UserRepository.findByIdAndUpdate(userEditId, data, { new: true });
  }

  async delete(_id: string) {
    return await UserRepository.findByIdAndRemove(_id);
  }

  async getByProfile({ userId, profile }: any) {
    let query: any;
    const userData: any = await this.getById(userId);
    query = { organization: userData.organization };

    return await UserRepository.find(query).select('name rules');
  }

  async userExist(email: string, withPassworld?: boolean) {
    if (withPassworld) {
      const userPass = await UserRepository.findOne({ email })
        .select('+password')
        .populate('organization');
      return userPass;
    }

    const user = await UserRepository.findOne({ email });
    return user;
  }

  async updateSituation(_id: string, situation: string) {
    if (!['A', 'I', 'P'].includes(situation)) {
      throw new AppError('Situação inválida');
    }
    return await this.update(_id, { situation });
  }

  async updateTerm(_id: string, term: any) {
    const user: any = await this.getById(_id);
    const terms: any = user.terms.filter((termUser: any) => termUser?.key === term?.key)
    
    if (!Object.values(TermKey).includes(term.key)) {
      throw new AppError('Termo não cadastrado');
    }

    if(!!terms.length) {
      throw new AppError('Termo já aceito');
    }

    user.terms.push({...term, accept: true})
    user.save();
    return user;
  }

  async userExistWithFields(email: string, withFields?: string) {
    if (withFields) {
      const user = await UserRepository.findOne({ email }).select(withFields);
      return user;
    }
    return this.userExist(email);
  }

  async alterPasswordByEmail(email: string) {
    const token = await crypto.randomBytes(20).toString('hex');
    const now = new Date();

    now.setHours(now.getHours() + 1);

    const user: any = await this.userExist(email);

    if (!user) {
      throw new AppError('Usuário não cadastrado');
    }

    await UserRepository.findByIdAndUpdate(user._id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });

    Mail.to = user.email;
    Mail.subject = 'Redefinição senha sistema Vivalisto';
    Mail.message = `Solicitação de alteração de senha. <a href=${apiServer.prod}/reset-password/${user.email}/${token}> Clique aqui para alterar sua senha</a>`;
    await Mail.sendMail();

    return;
  }

  async resetPasswordByForgotPassword(
    email: string,
    password: string,
    token: string
  ) {
    const user: any = await this.userExistWithFields(
      email,
      '+passwordResetToken passwordResetExpires situation'
    );

    if (token !== user.passwordResetToken) {
      throw new AppError('Token inválido', 401);
    }

    const now = new Date();

    if (now > user.passwordResetExpires) {
      throw new AppError('Token expirado, gere um novo token', 401);
    }

    if (user.situation === UserSituation.Inativo) {
      throw new AppError('Usuário inativo, entre em contato com seu superior', 401);
    }

    if (user.situation === UserSituation.Pendente) {
      user.situation = UserSituation.Ativo
    }

    user.password = password;
    user.save();
  }

  async sendInvite(email: string) {
    const token = crypto.randomBytes(20).toString('hex');
    const now = new Date();

    now.setHours(now.getHours() + 1);

    const user: any = await this.userExist(email);

    if (!user) {
      throw new AppError('Usuário não cadastrado');
    }

    await UserRepository.findByIdAndUpdate(user._id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });

    await sendMailUtil({
      to: user.email,
      subject: 'VIVALISTO - Liberação de acesso',
      message: `Olá, ${user.name}, Bem-vindo à Vivalisto, a sua nova plataforma de negócios. Para prosseguir com seu cadastro. <a href=${apiServer.prod}/reset-password/${user.email}/${token}> Clique aqui para Definir uma senha.</a>`,
    });
    return;
  }

  async generateToken(user: any) {
    return jwt.sign({ id: user._id }, keys.secretOrKey, {
      expiresIn: 86400,
    });
  }
}

export default new UserService();
