"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_status_1 = __importStar(require("http-status")), HttpStatus = http_status_1;
var stageService_1 = __importDefault(require("../services/stageService"));
var helper_1 = __importDefault(require("../utils/helper"));
var StageController = /** @class */ (function () {
    function StageController() {
    }
    StageController.prototype.create = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, stageRequest, stage, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = req.userId;
                        stageRequest = req.body;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, stageService_1.default.create(stageRequest)];
                    case 2:
                        stage = _a.sent();
                        helper_1.default.sendResponse(res, HttpStatus.OK, { stage: stage });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error.bind(console, "Error " + error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StageController.prototype.get = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var stage, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, stageService_1.default.get()];
                    case 1:
                        stage = _a.sent();
                        helper_1.default.sendResponse(res, HttpStatus.OK, { stage: stage });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error.bind(console, "Error " + error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StageController.prototype.getById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, stage, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, stageService_1.default.getById(id)];
                    case 2:
                        stage = _a.sent();
                        helper_1.default.sendResponse(res, http_status_1.default.OK, { stage: stage });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error.bind(console, "Error " + error_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StageController.prototype.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, stageUpdate, user, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        stageUpdate = req.body;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, stageService_1.default.update(id, stageUpdate)];
                    case 2:
                        user = _a.sent();
                        helper_1.default.sendResponse(res, HttpStatus.OK, user);
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error.bind(console, "Error " + error_4);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StageController.prototype.delete = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, stageService_1.default.delete(id)];
                    case 2:
                        _a.sent();
                        helper_1.default.sendResponse(res, http_status_1.default.OK, 'Stage deletado com sucesso');
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error.bind(console, "Error " + error_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return StageController;
}());
exports.default = new StageController();