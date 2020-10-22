"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var RuleController_1 = __importDefault(require("../controllers/RuleController"));
var auth_1 = __importDefault(require("../middlewares/auth"));
var ruleRouter = express_1.default.Router();
ruleRouter.use(auth_1.default);
ruleRouter.get('/', RuleController_1.default.get);
ruleRouter.get('/:id', RuleController_1.default.getById);
ruleRouter.post('/', RuleController_1.default.create);
ruleRouter.put('/', RuleController_1.default.update);
ruleRouter.delete('/:id', RuleController_1.default.delete);
exports.default = ruleRouter;
