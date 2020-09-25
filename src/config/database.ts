import mongoose from 'mongoose';
import keys from './keys-dev';
import path from 'path';

class DataBase {
  private DB_URL = keys.mongoURI;

  createConnection() {
    mongoose
      .connect(this.DB_URL, {
        useNewUrlParser: true,
        tls: true,
        tlsCAFile: path.resolve(
          __dirname,
          'certificado',
          '48b1ff99-7b37-4370-b9e6-229f4b939777'
        ),
        useUnifiedTopology: true,
      })
      .then(() => console.log('Conexão com o db realizada com sucesso'))
      .catch((error) => {
        console.log(error);
      });
  }
}

export default DataBase;
