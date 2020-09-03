import * as mongoose from 'mongoose';
import CustomerModel from '../models/CustomerModel';

export default mongoose.model('customer', CustomerModel);
