import * as mongoose from 'mongoose';
import UserSchema from '../models/UserModel';

export default mongoose.model('users', UserSchema);
