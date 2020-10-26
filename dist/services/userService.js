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
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var crypto_1 = __importDefault(require("crypto"));
var userRepository_1 = __importDefault(require("../repositories/userRepository"));
var organizationService_1 = __importDefault(require("../services/organizationService"));
var keys_dev_1 = __importDefault(require("../config/keys-dev"));
var emailService_1 = __importDefault(require("../services/emailService"));
var AppError_1 = __importDefault(require("../errors/AppError"));
var api_1 = require("../config/api");
var sendMail_1 = require("../utils/sendMail");
var access_control_enum_1 = require("../enums/access-control.enum");
var user_situation_enum_1 = require("../enums/user-situation.enum");
var term_key_enum_1 = require("../enums/term-key.enum");
var UserService = /** @class */ (function () {
    function UserService() {
    }
    UserService.prototype.get = function (userId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var query, userData;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getById(userId)];
                    case 1:
                        userData = _c.sent();
                        if (((_a = userData === null || userData === void 0 ? void 0 : userData.rules) === null || _a === void 0 ? void 0 : _a.profile) === access_control_enum_1.ProfileType.Master) {
                            query = { organization: userData.organization };
                        }
                        else if (((_b = userData === null || userData === void 0 ? void 0 : userData.rules) === null || _b === void 0 ? void 0 : _b.profile) === access_control_enum_1.ProfileType.Gerente) {
                            query = { owner: userData._id };
                        }
                        else {
                            query = { userId: userId };
                        }
                        return [4 /*yield*/, userRepository_1.default.find(query).select('-avatar')];
                    case 2: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    UserService.prototype.getById = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userRepository_1.default.findById(_id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserService.prototype.create = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var userAux, userExist, organization, organizationExist;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userExist(user.email)];
                    case 1:
                        userExist = _a.sent();
                        if (userExist) {
                            throw new AppError_1.default('Usuário já cadastrado no sistema');
                        }
                        if (!user.isOrganization) return [3 /*break*/, 4];
                        return [4 /*yield*/, organizationService_1.default.exist(user.organization.document)];
                    case 2:
                        organizationExist = _a.sent();
                        if (organizationExist) {
                            throw new AppError_1.default('Imobiliária já cadastrada no sistema');
                        }
                        return [4 /*yield*/, organizationService_1.default.create(user.organization)];
                    case 3:
                        organization = _a.sent();
                        userAux = __assign(__assign({}, user), { organization: organization.id });
                        return [3 /*break*/, 5];
                    case 4:
                        userAux = user;
                        _a.label = 5;
                    case 5: return [4 /*yield*/, userRepository_1.default.create(userAux).catch(function (error) {
                            console.log(error);
                            throw new AppError_1.default('Erro no cadastro, verifique seus dados');
                        })];
                    case 6: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserService.prototype.createInvite = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var userExist;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userExist(user.email)];
                    case 1:
                        userExist = _a.sent();
                        if (userExist) {
                            throw new AppError_1.default('Usuário já cadastrado no sistema');
                        }
                        return [4 /*yield*/, userRepository_1.default.create(user).catch(function (error) {
                                console.log(error);
                                throw new AppError_1.default('Erro no cadastro, verifique seus dados');
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserService.prototype.update = function (_id, user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userRepository_1.default.findByIdAndUpdate(_id, user, { new: true })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserService.prototype.delete = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userRepository_1.default.findByIdAndRemove(_id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserService.prototype.getByProfile = function (_a) {
        var userId = _a.userId, profile = _a.profile;
        return __awaiter(this, void 0, void 0, function () {
            var query, userData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getById(userId)];
                    case 1:
                        userData = _b.sent();
                        query = { organization: userData.organization };
                        return [4 /*yield*/, userRepository_1.default.find(query).select('name rules')];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    UserService.prototype.userExist = function (email, withPassworld) {
        return __awaiter(this, void 0, void 0, function () {
            var userPass, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!withPassworld) return [3 /*break*/, 2];
                        return [4 /*yield*/, userRepository_1.default.findOne({ email: email })
                                .select('+password')
                                .populate('organization')];
                    case 1:
                        userPass = _a.sent();
                        return [2 /*return*/, userPass];
                    case 2: return [4 /*yield*/, userRepository_1.default.findOne({ email: email })];
                    case 3:
                        user = _a.sent();
                        return [2 /*return*/, user];
                }
            });
        });
    };
    UserService.prototype.updateSituation = function (_id, situation) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!['A', 'I', 'P'].includes(situation)) {
                            throw new AppError_1.default('Situação inválida');
                        }
                        return [4 /*yield*/, this.update(_id, { situation: situation })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserService.prototype.updateTerm = function (_id, term) {
        return __awaiter(this, void 0, void 0, function () {
            var user, terms;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getById(_id)];
                    case 1:
                        user = _a.sent();
                        terms = user.terms.filter(function (termUser) { return (termUser === null || termUser === void 0 ? void 0 : termUser.key) === (term === null || term === void 0 ? void 0 : term.key); });
                        if (!Object.values(term_key_enum_1.TermKey).includes(term.key)) {
                            throw new AppError_1.default('Termo não cadastrado');
                        }
                        if (!!terms.length) {
                            throw new AppError_1.default('Termo já aceito');
                        }
                        user.terms.push(__assign(__assign({}, term), { accept: true }));
                        user.save();
                        return [2 /*return*/, user];
                }
            });
        });
    };
    UserService.prototype.userExistWithFields = function (email, withFields) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!withFields) return [3 /*break*/, 2];
                        return [4 /*yield*/, userRepository_1.default.findOne({ email: email }).select(withFields)];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, user];
                    case 2: return [2 /*return*/, this.userExist(email)];
                }
            });
        });
    };
    UserService.prototype.alterPasswordByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var token, now, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, crypto_1.default.randomBytes(20).toString('hex')];
                    case 1:
                        token = _a.sent();
                        now = new Date();
                        now.setHours(now.getHours() + 1);
                        return [4 /*yield*/, this.userExist(email)];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            throw new AppError_1.default('Usuário não cadastrado');
                        }
                        return [4 /*yield*/, userRepository_1.default.findByIdAndUpdate(user._id, {
                                $set: {
                                    passwordResetToken: token,
                                    passwordResetExpires: now,
                                },
                            })];
                    case 3:
                        _a.sent();
                        emailService_1.default.to = user.email;
                        emailService_1.default.subject = 'Redefinição senha sistema Vivalisto';
                        emailService_1.default.message = "Solicita\u00E7\u00E3o de altera\u00E7\u00E3o de senha. <a href=" + api_1.apiServer.prod + "/reset-password/" + user.email + "/" + token + "> Clique aqui para alterar sua senha</a>";
                        return [4 /*yield*/, emailService_1.default.sendMail()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.resetPasswordByForgotPassword = function (email, password, token) {
        return __awaiter(this, void 0, void 0, function () {
            var user, now;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userExistWithFields(email, '+passwordResetToken passwordResetExpires')];
                    case 1:
                        user = _a.sent();
                        if (token !== user.passwordResetToken) {
                            throw new AppError_1.default('Token inválido', 401);
                        }
                        now = new Date();
                        if (now > user.passwordResetExpires) {
                            throw new AppError_1.default('Token expirado, gere um novo token', 401);
                        }
                        if (user.situation === user_situation_enum_1.UserSituation.Pendente) {
                            user.situation = user_situation_enum_1.UserSituation.Ativo;
                        }
                        user.password = password;
                        user.save();
                        return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.sendInvite = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var token, now, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = crypto_1.default.randomBytes(20).toString('hex');
                        now = new Date();
                        now.setHours(now.getHours() + 1);
                        return [4 /*yield*/, this.userExist(email)];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new AppError_1.default('Usuário não cadastrado');
                        }
                        return [4 /*yield*/, userRepository_1.default.findByIdAndUpdate(user._id, {
                                $set: {
                                    passwordResetToken: token,
                                    passwordResetExpires: now,
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, sendMail_1.sendMailUtil({
                                to: user.email,
                                subject: 'VIVALISTO - Liberação de acesso',
                                message: "Ol\u00E1, " + user.name + ", Bem-vindo \u00E0 Vivalisto, a sua nova plataforma de neg\u00F3cios. Para prosseguir com seu cadastro. <a href=" + api_1.apiServer.prod + "/reset-password/" + user.email + "/" + token + "> Clique aqui para Definir uma senha.</a>",
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.generateToken = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, jsonwebtoken_1.default.sign({ id: user._id }, keys_dev_1.default.secretOrKey, {
                        expiresIn: 86400,
                    })];
            });
        });
    };
    return UserService;
}());
exports.default = new UserService();
