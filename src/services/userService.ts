import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

import UserRepository from '../repositories/userRepository';
import keys from '../config/keys-dev';
import Mail from '../services/emailService';

class UserService {
  async get() {
    return await UserRepository.find();
  }

  async getById(_id: string) {
    return await UserRepository.findById(_id);
  }

  async create(user: any) {
    return await UserRepository.create(user);
  }

  async update(_id: string, user: any) {
    return await UserRepository.findByIdAndUpdate(_id, user, { new: true });
  }

  async delete(_id: string) {
    return await UserRepository.findByIdAndRemove(_id);
  }

  async userExist(email: string, withPassworld?: boolean) {
    if (withPassworld) {
      return await UserRepository.findOne({ email }).select('+password');
    }

    const user = await UserRepository.findOne({ email });

    if (!user) {
      throw new Error('E-mail não encontrado. Verifique os dados digitados.');
    }
    return user;
  }

  async userExistWithFields(email: string, withFields?: string) {
    if (withFields) {
      const user = await UserRepository.findOne({ email }).select(withFields);
      if (!user) {
        throw new Error('E-mail não encontrado. Verifique os dados digitados.');
      }
      return user;
    }
    return this.userExist(email);
  }

  async updatePasswordReset(email: string) {
    const token = await crypto.randomBytes(20).toString('hex');
    const now = new Date();

    now.setHours(now.getHours() + 1);

    const user: any = await this.userExist(email);

    await UserRepository.findByIdAndUpdate(user._id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });

    Mail.to = user.email;
    Mail.subject = 'Redefinição senha sistema Vivalisto';
    Mail.message = `Solicitação de alteração de senha. <a href=http://localhost:3000/reset-password/${user.email}/${token}> Clique aqui para alterar sua senha</a>`;
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
      throw new Error('Token inválido');
    }

    const now = new Date();

    if (now > user.passwordResetExpires) {
      throw new Error('Token expirado, gere um novo token');
    }

    user.password = password;
    user.save();
  }

  async generateToken(user: any) {
    return jwt.sign({ id: user._id }, keys.secretOrKey, {
      expiresIn: 86400,
    });
  }
}

export default new UserService();
