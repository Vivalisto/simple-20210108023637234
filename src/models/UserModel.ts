import * as mongoose from 'mongoose';

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

export default UserSchema;
