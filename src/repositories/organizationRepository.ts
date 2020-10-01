import * as mongoose from 'mongoose';
import OrganizationSchema from '../models/OrganizationModel';

export default mongoose.model('organization', OrganizationSchema);
