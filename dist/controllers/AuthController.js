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
var Yup = __importStar(require("yup"));
var HttpStatus = __importStar(require("http-status"));
var userService_1 = __importDefault(require("../services/userService"));
var helper_1 = __importDefault(require("../utils/helper"));
var authValidation_1 = require("../validation/authValidation");
var inviteValidation_1 = require("../validation/inviteValidation");
var authService_1 = __importDefault(require("../services/authService"));
var schema = Yup.object().shape({
    email: Yup.string().required().email(),
    password: Yup.string().required(),
});
var AuthController = /** @class */ (function () {
    function AuthController() {
    }
    AuthController.prototype.register = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userRequest, user, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userRequest = req.body;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, authValidation_1.registerValidation(req.body)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, authService_1.default.register(userRequest)];
                    case 3:
                        user = _a.sent();
                        helper_1.default.sendResponse(res, HttpStatus.OK, {
                            message: 'Usuário cadastrado com sucesso',
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        helper_1.default.sendResponse(res, error_1.statusCode, error_1.message);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.authenticate = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, password, auth, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, email = _a.email, password = _a.password;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, authValidation_1.authenticateValidation(req.body)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, authService_1.default.authenticate(email, password)];
                    case 3:
                        auth = _b.sent();
                        helper_1.default.sendResponse(res, HttpStatus.OK, auth);
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        helper_1.default.sendResponse(res, error_2.statusCode, error_2.message);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.forgotPassword = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var email, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = req.body.email;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, userService_1.default.alterPasswordByEmail(email)];
                    case 2:
                        _a.sent();
                        helper_1.default.sendResponse(res, HttpStatus.OK, {
                            message: "Link de altera\u00E7\u00E3o de senha enviado para o email " + email + ".",
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        helper_1.default.sendResponse(res, error_3.statusCode, error_3.message || 'Erro inesperado');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.resetPassword = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, password, token, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, email = _a.email, password = _a.password, token = _a.token;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, userService_1.default.resetPasswordByForgotPassword(email, password, token)];
                    case 2:
                        _b.sent();
                        helper_1.default.sendResponse(res, HttpStatus.OK, {
                            message: 'Senha alterada com sucesso',
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        helper_1.default.sendResponse(res, error_4.statusCode, error_4.message || 'Erro inesperado');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.invite = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userRequest, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userRequest = req.body;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, inviteValidation_1.inviteValidation(req.body)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, authService_1.default.registerInvite(userRequest, req.userId)];
                    case 3:
                        _a.sent();
                        helper_1.default.sendResponse(res, HttpStatus.OK, {
                            message: 'Usuário cadastrado com sucesso',
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        helper_1.default.sendResponse(res, error_5.statusCode, error_5.message);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return AuthController;
}());
exports.default = new AuthController();
