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
    return await UserRepository.findOne({ email });
  }

  async updatePasswordReset(user: any) {
    const token = await crypto.randomBytes(20).toString('hex');
    const now = new Date();

    now.setHours(now.getHours() + 1);

    Mail.to = user.email;
    Mail.subject = 'Redefinição senha sistema Vivalisto';
    Mail.message = 'Sua senha foi alterada. Nova senha: ';
    let result = Mail.sendMail();

    return await UserRepository.findByIdAndUpdate(user._id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });
  }

  async generateToken(user: any) {
    return jwt.sign({ id: user._id }, keys.secretOrKey, {
      expiresIn: 86400,
    });
  }
}

export default new UserService();
