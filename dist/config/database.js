"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var keys_dev_1 = __importDefault(require("./keys-dev"));
var path_1 = __importDefault(require("path"));
var DataBase = /** @class */ (function () {
    function DataBase() {
        this.DB_URL = keys_dev_1.default.mongoURI;
    }
    DataBase.prototype.createConnection = function () {
        mongoose_1.default
            .connect(this.DB_URL, {
            useNewUrlParser: true,
            tls: true,
            tlsCAFile: path_1.default.resolve(__dirname, 'certificado', '48b1ff99-7b37-4370-b9e6-229f4b939777'),
            useUnifiedTopology: true,
        })
            .then(function () { return console.log('Conexão com o db realizada com sucesso'); })
            .catch(function (error) {
            console.log(error);
        });
    };
    return DataBase;
}());
exports.default = DataBase;
