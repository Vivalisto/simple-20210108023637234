import mongoose from 'mongoose';
import keys from './keys-dev';

class DataBase {
  private DB_URL = keys.mongoURI;

  createConnection() {
    mongoose.connect(this.DB_URL, { useNewUrlParser: true });
  }
}

export default DataBase;
