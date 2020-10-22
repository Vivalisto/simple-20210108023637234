"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var AuthController_1 = __importDefault(require("../controllers/AuthController"));
var auth_1 = __importDefault(require("../middlewares/auth"));
var authRouter = express_1.default.Router();
authRouter.post('/register', AuthController_1.default.register);
authRouter.post('/authenticate', AuthController_1.default.authenticate);
authRouter.post('/forgot-password', AuthController_1.default.forgotPassword);
authRouter.post('/reset-password', AuthController_1.default.resetPassword);
authRouter.use(auth_1.default);
authRouter.post('/invite', AuthController_1.default.invite);
exports.default = authRouter;
