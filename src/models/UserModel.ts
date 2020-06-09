import mongoose from '../config/database';

const Schema = mongoose.Schema;

//schema
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: { type: String },
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
  created: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model('users', userSchema);
