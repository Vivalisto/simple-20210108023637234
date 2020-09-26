import * as mongoose from 'mongoose';

import {
  GroupType,
  ProfileType,
  ResourceControl,
} from '../enums/access-control.enum';

const ResourceSchema: mongoose.Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    uppercase: true,
    enum: Object.values(ResourceControl),
  },
  action: {
    type: [String],
  },
});

const ProfileSchema: mongoose.Schema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    uppercase: true,
    enum: Object.values(ProfileType),
  },
  resource: [ResourceSchema],
});

const RoleSchema: mongoose.Schema = new mongoose.Schema({
  group: {
    type: String,
    required: true,
    uppercase: true,
    enum: Object.values(GroupType),
  },
  profile: ProfileSchema,
  description: {
    type: String,
  },
});

export default RoleSchema;
