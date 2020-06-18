import mongoose from 'mongoose';

const url =
  'mongodb://dbuser:vivalisto2020@ds125716.mlab.com:25716/vivalisto-dev';
// const url = 'mongodb://dbuser:dbuser18@ds249267.mlab.com:49267/vivalisto';
// const url = 'mongodb://localhost:27017/vivalisto';

mongoose.connect(url, { useNewUrlParser: true });

export default mongoose;
