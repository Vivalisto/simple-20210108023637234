import mongoose from 'mongoose';

const url = 'mongodb://localhost:27017/vivalisto';

mongoose.connect(url, { useNewUrlParser: true });

export default mongoose;
