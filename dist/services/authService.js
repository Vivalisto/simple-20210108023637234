"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var userService_1 = __importDefault(require("../services/userService"));
var AppError_1 = __importDefault(require("../errors/AppError"));
var ruleService_1 = __importDefault(require("./ruleService"));
var user_situation_enum_1 = require("../enums/user-situation.enum");
var access_control_enum_1 = require("../enums/access-control.enum");
var AuthService = /** @class */ (function () {
    function AuthService() {
    }
    AuthService.prototype.register = function (userRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var userRule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userRule = {};
                        if (userRequest.isOrganization) {
                            userRule = __assign(__assign({}, userRequest), { rules: { group: access_control_enum_1.GroupType.Imobiliaria, profile: access_control_enum_1.ProfileType.Master } });
                        }
                        else {
                            userRule = __assign(__assign({}, userRequest), { rules: { group: access_control_enum_1.GroupType.Autonomo, profile: access_control_enum_1.ProfileType.Master } });
                        }
                        return [4 /*yield*/, userService_1.default.create(userRule)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AuthService.prototype.registerInvite = function (userRequest, owner) {
        return __awaiter(this, void 0, void 0, function () {
            var userIvite, newUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userIvite = __assign(__assign({}, userRequest), { owner: !!userRequest.owner ? userRequest.owner : owner, password: '12345' });
                        return [4 /*yield*/, userService_1.default.createInvite(userIvite)];
                    case 1:
                        newUser = _a.sent();
                        if (!newUser) return [3 /*break*/, 3];
                        return [4 /*yield*/, userService_1.default.sendInvite(userIvite.email)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, newUser];
                }
            });
        });
    };
    AuthService.prototype.authenticate = function (email, password) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userAuth, validPassword, rule, rules, token;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, userService_1.default.userExist(email, true)];
                    case 1:
                        userAuth = _b.sent();
                        if (!userAuth) {
                            throw new AppError_1.default('usuário não cadastrado');
                        }
                        if (userAuth.situation === user_situation_enum_1.UserSituation.Inativo) {
                            throw new AppError_1.default('Usuário inátivo, favor entre em contato com seu superior', 401);
                        }
                        return [4 /*yield*/, bcryptjs_1.default.compare(password, userAuth.password)];
                    case 2:
                        validPassword = _b.sent();
                        if (!validPassword) {
                            throw new AppError_1.default('Senha inválida');
                        }
                        rule = (_a = userAuth === null || userAuth === void 0 ? void 0 : userAuth._doc) === null || _a === void 0 ? void 0 : _a.rules;
                        return [4 /*yield*/, ruleService_1.default.getByGroupProfile(rule.group, rule.profile)];
                    case 3:
                        rules = _b.sent();
                        return [4 /*yield*/, userService_1.default.generateToken(userAuth)];
                    case 4:
                        token = _b.sent();
                        return [2 /*return*/, {
                                user: __assign(__assign({}, userAuth === null || userAuth === void 0 ? void 0 : userAuth._doc), { password: '******', rules: rules
                                        ? rules
                                        : {
                                            group: rule.group,
                                            profile: rule.profile,
                                            message: 'Regras não definidas para grupo e perfil',
                                        } }),
                                token: token,
                            }];
                }
            });
        });
    };
    return AuthService;
}());
exports.default = new AuthService();
