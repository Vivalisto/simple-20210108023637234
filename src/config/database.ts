import mongoose from 'mongoose';

const url = 'mongodb://dbuser:dbuser18@ds249267.mlab.com:49267/docker-db';
// const url = 'mongodb://localhost:27017/vivalisto';

mongoose.connect(url, { useNewUrlParser: true });

export default mongoose;
