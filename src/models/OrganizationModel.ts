import * as mongoose from 'mongoose';

const OrganizationSchema: mongoose.Schema = new mongoose.Schema({
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
  created: {
    type: Date,
    default: Date.now(),
  },
});

export default OrganizationSchema;
