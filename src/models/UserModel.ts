import * as mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { NextFunction } from 'express';
import { object, boolean, string } from 'yup';

// corretor autonomo
interface IUser {
  name: string;
  email: string;
  password: string;
  cpf: string;
  cellphone: string;
  birthDate: string;
  creci?: string;
  isBroker: boolean;
  active: boolean;
  isOrganization: boolean;
  avatar: string;
  organization: {
    document?: string;
    name?: string;
    creci?: string;
    image?: string;
  };
}

const UserSchema: mongoose.Schema = new mongoose.Schema({
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
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  cpf: {
    type: String,
    required: true,
  },
  cellphone: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  creci: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  isBroker: {
    type: Boolean,
    default: true,
  },
  avatar: {
    type: String,
  },
  isOrganization: {
    type: Boolean,
    default: false,
  },
  organization: {
    document: {
      type: String,
    },
    name: {
      type: String,
    },
    creci: {
      type: String,
    },
    image: {
      type: String,
    },
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
