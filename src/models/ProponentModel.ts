import * as mongoose from 'mongoose';

import { PersonType } from '../enums/person-type.enum';

const ProponentSchema: mongoose.Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  personType: {
    type: String,
    required: true,
    uppercase: true,
    enum: Object.values(PersonType),
  },
  organizationName: {
    type: String,
  },
  activityBranch: {
    type: String,
  },
});

export default ProponentSchema;
