import mongoose from 'mongoose';

class DataBase {
  private DB_URL =
    'mongodb://dbuser:vivalisto2020@ds125716.mlab.com:25716/vivalisto-dev';

  createConnection() {
    mongoose.connect(this.DB_URL, { useNewUrlParser: true });
  }
}

export default DataBase;
