import * as mongoose from 'mongoose';

import { ResourcesControl, GroupType } from '../enums/access-control.enum';

const ProfileSchema: mongoose.Schema = new mongoose.Schema({
  resource: {
    type: String,
    required: true,
    enum: Object.values(ResourcesControl),
  },
  actions: [],
});

const RouleSchema: mongoose.Schema = new mongoose.Schema({
  group: {
    type: String,
    enum: Object.values(GroupType),
  },
  profile: ProfileSchema,
  description: {
    type: String,
  },
});

export default RouleSchema;
