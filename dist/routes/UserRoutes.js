"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var UserController_1 = __importDefault(require("../controllers/UserController"));
var auth_1 = __importDefault(require("../middlewares/auth"));
var userRouter = express_1.default.Router();
userRouter.get('/test', function (req, res) { return res.json({ msg: 'server ativo' }); });
userRouter.use(auth_1.default);
userRouter.get('/profile', UserController_1.default.getByProfile);
userRouter.get('/', UserController_1.default.get);
userRouter.get('/:id', UserController_1.default.getById);
userRouter.post('/', UserController_1.default.create);
userRouter.put('/', UserController_1.default.update);
userRouter.put('/:id/situation', UserController_1.default.updateSituation);
userRouter.delete('/:id', UserController_1.default.delete);
exports.default = userRouter;
