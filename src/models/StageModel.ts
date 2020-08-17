import * as mongoose from 'mongoose';

const StageSchema: mongoose.Schema = new mongoose.Schema({
  stage: {
    type: Number,
    required: true,
    default: 0,
    unique: true,
  },
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
});

export default StageSchema;
