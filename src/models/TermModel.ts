import * as mongoose from 'mongoose';

import {TermKey} from '../enums/term-key.enum'

const TermSchema: mongoose.Schema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: Object.values(TermKey),
  },
  accept: {
    type: Boolean,
    required: true,
    default: false,
  },
  dateAccept: {
    type: Date,
    default: Date.now(),
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
});

export default TermSchema;
