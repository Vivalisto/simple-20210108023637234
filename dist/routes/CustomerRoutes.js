"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var CustomerController_1 = __importDefault(require("../controllers/CustomerController"));
var auth_1 = __importDefault(require("../middlewares/auth"));
var customerRouter = express_1.default.Router();
customerRouter.use(auth_1.default);
customerRouter.get('/', CustomerController_1.default.get);
customerRouter.get('/:id', CustomerController_1.default.getById);
customerRouter.post('/', CustomerController_1.default.create);
customerRouter.put('/', CustomerController_1.default.update);
customerRouter.delete('/:id', CustomerController_1.default.delete);
exports.default = customerRouter;
