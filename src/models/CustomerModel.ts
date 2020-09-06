import * as mongoose from 'mongoose';

import { PersonType } from '../enums/person-type.enum';
import { CustomerType } from '../enums/customer-type.enum';

const CustomerSchema: mongoose.Schema = new mongoose.Schema({
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  personType: {
    type: String,
    uppercase: true,
    enum: Object.values(PersonType),
    default: PersonType.PessoaFisica,
  },
  organizationName: {
    type: String,
  },
  activityBranch: {
    type: String,
  },
  type: {
    type: String,

    enum: Object.values(CustomerType),
  },
});

export default CustomerSchema;
