import * as mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { NextFunction } from 'express';

interface IUser {
  name: string;
  email: string;
  cpf: string;
  cellphone: string;
  password: string;
  birthDate: Date;
  created: Date;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  cpf: {
    type: String,
    required: true,
  },
  creci: {
    type: String,
  },
  cellphone: {
    type: String,
    required: true,
  },
  isBroker: {
    type: Boolean,
    default: true,
  },
  isOrganization: {
    type: Boolean,
    required: true,
    default: false,
  },
  organization: {
    cnpj: String,
    cpf: String,
    creci: String,
    name: String,
    image: String,
    useCpf: Boolean,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

UserSchema.pre('save', async function (next) {
  const user: any = this;

  if (user.password) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

export default UserSchema;
