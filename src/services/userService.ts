import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

import UserRepository from '../repositories/userRepository';
import OrganizationService from '../services/organizationService';
import keys from '../config/keys-dev';
import Mail from '../services/emailService';

import AppError from '../errors/AppError';

import { apiServer } from '../config/api';
import { sendMail } from '../utils/sendMail';

class UserService {
  async get(owner: string) {
    return await UserRepository.find({ owner }).select('-avatar');
  }

  async getById(_id: string) {
    return await UserRepository.findById(_id);
  }

  async create(user: any) {
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
    }

    return await UserRepository.create({
      ...user,
      organization: organization.id,
    }).catch((error) => {
      console.log(error);
      throw new AppError('Erro no cadastro, verifique seus dados');
    });
  }

  async update(_id: string, user: any) {
    return await UserRepository.findByIdAndUpdate(_id, user, { new: true });
  }

  async delete(_id: string) {
    return await UserRepository.findByIdAndRemove(_id);
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
      '+passwordResetToken passwordResetExpires'
    );

    if (token !== user.passwordResetToken) {
      throw new AppError('Token inválido', 401);
    }

    const now = new Date();

    if (now > user.passwordResetExpires) {
      throw new AppError('Token expirado, gere um novo token', 401);
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

    await sendMail(
      user.email,
      'VIVALISTO - Liberação de acesso',
      `Olá, ${user.name}, Bem-vindo à Vivalisto, a sua nova plataforma de negócios. Para prosseguir com seu cadastro. <a href=${apiServer.prod}/reset-password/${user.email}/${token}> Clique aqui para Definir uma senha.</a>`
    );
    return;
  }

  async generateToken(user: any) {
    return jwt.sign({ id: user._id }, keys.secretOrKey, {
      expiresIn: 86400,
    });
  }
}

export default new UserService();
