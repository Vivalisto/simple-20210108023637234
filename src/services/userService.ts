import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

import UserRepository from '../repositories/userRepository';
import keys from '../config/keys-dev';
import Mail from '../services/emailService';

import AppError from '../errors/AppError';

class UserService {
  async get() {
    return await UserRepository.find().select('-avatar');
  }

  async getById(_id: string) {
    return await UserRepository.findById(_id);
  }

  async create(user: any) {
    const userExist = await this.userExist(user.email);

    if (userExist) {
      throw new AppError('Usuário já cadastrado no sistema');
    }

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
      const userPass = await UserRepository.findOne({ email }).select(
        '+password'
      );
      return userPass;
    }

    const user = await UserRepository.findOne({ email });
    return user;
  }

  async userExistWithFields(email: string, withFields?: string) {
    if (withFields) {
      const user = await UserRepository.findOne({ email }).select(withFields);
      return user;
    }
    return this.userExist(email);
  }

  async forgotPassword(email: string) {
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
    Mail.message = `Solicitação de alteração de senha. <a href=http://150.238.42.242:30080/reset-password/${user.email}/${token}> Clique aqui para alterar sua senha</a>`;
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

  async generateToken(user: any) {
    return jwt.sign({ id: user._id }, keys.secretOrKey, {
      expiresIn: 86400,
    });
  }
}

export default new UserService();
