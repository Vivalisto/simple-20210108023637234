import * as mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { NextFunction } from 'express';
import { object, boolean, string } from 'yup';

import { UserSituation } from '../enums/user-situation.enum';
import { GroupType, ProfileType } from '../enums/access-control.enum';

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

const UserAccessSchema: mongoose.Schema = new mongoose.Schema({
  group: {
    type: String,
    default: GroupType.Autonomo,
    required: true,
    uppercase: true,
    enum: Object.values(GroupType),
  },
  profile: {
    type: String,
    default: ProfileType.Master,
    uppercase: true,
    required: true,
    enum: Object.values(ProfileType),
  },
});

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
  },
  cellphone: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
  },
  creci: {
    type: String,
  },
  situation: {
    type: String,
    default: UserSituation.Ativo,
    enum: Object.values(UserSituation),
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
  url: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  rules: {
    type: UserAccessSchema,
    default: { group: GroupType.Autonomo, profile: ProfileType.Master },
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
    cellphone: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    },
    organizationName: {
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
