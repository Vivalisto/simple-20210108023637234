import * as mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { NextFunction } from 'express';

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
  cellphone: {
    type: String,
    required: true,
  },
  isBroker: {
    type: Boolean,
    default: false,
  },
  organization: {},
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
