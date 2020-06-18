import mongoose from '../config/database';

const Schema = mongoose.Schema;

//schema
const userSchema = new Schema({
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

export default mongoose.model('users', userSchema);
