"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var database_1 = __importDefault(require("./config/database"));
var UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
var AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
var ProposalRoutes_1 = __importDefault(require("./routes/ProposalRoutes"));
var StageRoutes_1 = __importDefault(require("./routes/StageRoutes"));
var RuleRoutes_1 = __importDefault(require("./routes/RuleRoutes"));
var CustomerRoutes_1 = __importDefault(require("./routes/CustomerRoutes"));
var OrganizationRoutes_1 = __importDefault(require("./routes/OrganizationRoutes"));
var TermRoutes_1 = __importDefault(require("./routes/TermRoutes"));
var StartUp = /** @class */ (function () {
    function StartUp() {
        this.app = express_1.default();
        this._dataBase = new database_1.default();
        this._dataBase.createConnection();
        this.middler();
        this.routes();
    }
    StartUp.prototype.enableCors = function () {
        var options = {
            methods: 'GET, OPTIONS, PUT, POST, DELETE',
            origin: 'https://app.programadorfavorito.com.br/',
        };
    };
    StartUp.prototype.middler = function () {
        this.enableCors();
        this.app.use(cors_1.default());
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({ extended: false }));
    };
    StartUp.prototype.routes = function () {
        this.app.use('/api/v1/auth', AuthRoutes_1.default);
        this.app.use('/api/v1/users', UserRoutes_1.default);
        this.app.use('/api/v1/proposals', ProposalRoutes_1.default);
        this.app.use('/api/v1/stage', StageRoutes_1.default);
        this.app.use('/api/v1/rule', RuleRoutes_1.default);
        this.app.use('/api/v1/customer', CustomerRoutes_1.default);
        this.app.use('/api/v1/organization', OrganizationRoutes_1.default);
        this.app.use('/api/v1/term', TermRoutes_1.default);
        this.app.route('/').get(function (req, res) {
            return res.send({ versao: '0.0.1' });
        });
    };
    return StartUp;
}());
exports.default = new StartUp();
