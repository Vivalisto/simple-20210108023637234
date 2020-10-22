"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var StageController_1 = __importDefault(require("../controllers/StageController"));
var auth_1 = __importDefault(require("../middlewares/auth"));
var stageRouter = express_1.default.Router();
stageRouter.use(auth_1.default);
stageRouter.get('/', StageController_1.default.get);
stageRouter.get('/:id', StageController_1.default.getById);
stageRouter.post('/', StageController_1.default.create);
stageRouter.put('/', StageController_1.default.update);
stageRouter.delete('/:id', StageController_1.default.delete);
exports.default = stageRouter;
