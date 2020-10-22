"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var OrganizationController_1 = __importDefault(require("../controllers/OrganizationController"));
var auth_1 = __importDefault(require("../middlewares/auth"));
var organizationRouter = express_1.default.Router();
organizationRouter.use(auth_1.default);
organizationRouter.get('/', OrganizationController_1.default.get);
organizationRouter.get('/:id', OrganizationController_1.default.getById);
organizationRouter.post('/', OrganizationController_1.default.create);
organizationRouter.put('/:id', OrganizationController_1.default.update);
exports.default = organizationRouter;
