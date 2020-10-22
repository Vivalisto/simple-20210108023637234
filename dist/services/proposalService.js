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
var proposalRepository_1 = __importDefault(require("../repositories/proposalRepository"));
var customerRepository_1 = __importDefault(require("../repositories/customerRepository"));
var customerService_1 = __importDefault(require("../services/customerService"));
var proposal_status_enum_1 = require("../enums/proposal-status.enum");
var proposal_stage_enum_1 = require("../enums/proposal-stage.enum");
var proposal_type_enum_1 = require("../enums/proposal-type.enum");
var customer_type_enum_1 = require("../enums/customer-type.enum");
var AppError_1 = __importDefault(require("../errors/AppError"));
var userService_1 = __importDefault(require("./userService"));
var customerService_2 = __importDefault(require("./customerService"));
var sendMail_1 = require("../utils/sendMail");
var access_control_enum_1 = require("../enums/access-control.enum");
var api_1 = require("../config/api");
var organizationService_1 = __importDefault(require("./organizationService"));
var proposalUserFields = [
    'name',
    'isBroker',
    'isOrganization',
    'email',
    'cellphone',
    'creci',
];
var ProposalService = /** @class */ (function () {
    function ProposalService() {
    }
    ProposalService.prototype.create = function (proposal) {
        return __awaiter(this, void 0, void 0, function () {
            var proposalRepository, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, proposalRepository_1.default.create(proposal)];
                    case 1:
                        proposalRepository = _a.sent();
                        return [4 /*yield*/, proposalRepository.populate('proponent').execPopulate()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_1 = _a.sent();
                        console.log(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.get = function (userId, type) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var query, search, userProposal;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        query = [];
                        search = {};
                        return [4 /*yield*/, userService_1.default.getById(userId)];
                    case 1:
                        userProposal = _d.sent();
                        if (type === proposal_type_enum_1.ProposalType.Aluguel || type === proposal_type_enum_1.ProposalType.CompraVenda) {
                            query.push(type);
                        }
                        else {
                            query = [proposal_type_enum_1.ProposalType.Aluguel, proposal_type_enum_1.ProposalType.CompraVenda];
                        }
                        if (((_a = userProposal === null || userProposal === void 0 ? void 0 : userProposal.rules) === null || _a === void 0 ? void 0 : _a.profile) === access_control_enum_1.ProfileType.Master &&
                            userProposal.isOrganization) {
                            search = {
                                organization: { _id: userProposal === null || userProposal === void 0 ? void 0 : userProposal.organization },
                            };
                        }
                        else {
                            search = {
                                user: { _id: userId },
                            };
                        }
                        if (!(((_b = userProposal === null || userProposal === void 0 ? void 0 : userProposal.rules) === null || _b === void 0 ? void 0 : _b.group) === access_control_enum_1.GroupType.Vivalisto && ((_c = userProposal === null || userProposal === void 0 ? void 0 : userProposal.rules) === null || _c === void 0 ? void 0 : _c.profile) === access_control_enum_1.ProfileType.Master)) return [3 /*break*/, 3];
                        return [4 /*yield*/, proposalRepository_1.default.find()
                                .where('type')
                                .populate('locator')
                                .populate('proponent')
                                .populate('user')
                                .populate('organization')];
                    case 2: return [2 /*return*/, _d.sent()];
                    case 3: return [4 /*yield*/, proposalRepository_1.default.find(search)
                            .where('type')
                            .equals(query)
                            .populate('locator')
                            .populate('proponent')
                            .populate('user')];
                    case 4: return [2 /*return*/, _d.sent()];
                }
            });
        });
    };
    ProposalService.prototype.getById = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, proposalRepository_1.default.findById(_id)
                            .populate('locator')
                            .populate('proponent')
                            .populate('user')
                            .populate('organization')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ProposalService.prototype.getByIdView = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, proposalRepository_1.default.findById(_id)
                            .populate('user')
                            .populate('organization')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ProposalService.prototype.update = function (_id, proposal) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, proposalRepository_1.default.findByIdAndUpdate(_id, proposal, {
                            new: true,
                        })
                            .populate('locator')
                            .populate('proponent')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ProposalService.prototype.delete = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, proposalRepository_1.default.findByIdAndRemove(_id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ProposalService.prototype.updateStatus = function (_id, proposalStatus, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var proposalUpdate, proposal, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        proposalUpdate = proposalStatus;
                        return [4 /*yield*/, this.getById(_id)];
                    case 1:
                        proposal = _a.sent();
                        return [4 /*yield*/, userService_1.default.getById(userId)];
                    case 2:
                        user = _a.sent();
                        if (proposalStatus.status === proposal_status_enum_1.ProposalStatus.EmviadaContratacao) {
                            proposalUpdate = __assign(__assign({}, proposalStatus), { stage: proposal_stage_enum_1.ProposalStage.Documental });
                        }
                        if (proposalStatus.status === proposal_status_enum_1.ProposalStatus.EmNegociacao) {
                            proposalUpdate = __assign(__assign({}, proposalStatus), { stage: proposal_stage_enum_1.ProposalStage.Criacao });
                        }
                        if (proposalStatus.status === proposal_status_enum_1.ProposalStatus.Fechada) {
                            this.sendMailApproveRentBuySell(proposal, user);
                        }
                        if (proposalStatus.status === proposal_status_enum_1.ProposalStatus.EmviadaContratacao) {
                            this.sendMailHire(proposal, user);
                        }
                        return [4 /*yield*/, this.update(_id, proposalUpdate)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ProposalService.prototype.updateStage = function (proposalId, action, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var stageUpdate, proposal, userDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getById(proposalId)];
                    case 1:
                        proposal = _a.sent();
                        return [4 /*yield*/, userService_1.default.getById(userId)];
                    case 2:
                        userDB = _a.sent();
                        if (action === 'next') {
                            stageUpdate = proposal.stage + 1;
                        }
                        else if (action === 'previous') {
                            stageUpdate = proposal.stage - 1;
                        }
                        else {
                            throw new AppError_1.default("A\u00E7\u00E3o n\u00E3o permitida. N\u00E3o foi poss\u00EDvel atualizar o passo da proposta");
                        }
                        if (stageUpdate === proposal_stage_enum_1.ProposalStage.Criacao) {
                            throw new AppError_1.default('Proposta em contratação. Não é possível retornar para negociação!');
                        }
                        if (proposal.stage === proposal_stage_enum_1.ProposalStage.Finalizada) {
                            throw new AppError_1.default('Proposta já concluída. Não existe mais passos!');
                        }
                        this.SendMailByStage(stageUpdate, proposal, userDB);
                        return [4 /*yield*/, this.update(proposalId, { stage: stageUpdate })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ProposalService.prototype.getSignings = function (userId, type) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var query, search, userProposal;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        query = [];
                        search = {};
                        return [4 /*yield*/, userService_1.default.getById(userId)];
                    case 1:
                        userProposal = _d.sent();
                        if (type === proposal_type_enum_1.ProposalType.Aluguel || type === proposal_type_enum_1.ProposalType.CompraVenda) {
                            query.push(type);
                        }
                        else {
                            query = [proposal_type_enum_1.ProposalType.Aluguel, proposal_type_enum_1.ProposalType.CompraVenda];
                        }
                        if (((_a = userProposal === null || userProposal === void 0 ? void 0 : userProposal.rules) === null || _a === void 0 ? void 0 : _a.profile) === access_control_enum_1.ProfileType.Master &&
                            userProposal.isOrganization) {
                            search = {
                                organization: { _id: userProposal === null || userProposal === void 0 ? void 0 : userProposal.organization },
                                stage: { $gt: 0 },
                            };
                        }
                        else {
                            search = {
                                user: { _id: userId },
                                stage: { $gt: 0 },
                            };
                        }
                        if (!(((_b = userProposal === null || userProposal === void 0 ? void 0 : userProposal.rules) === null || _b === void 0 ? void 0 : _b.group) === access_control_enum_1.GroupType.Vivalisto && ((_c = userProposal === null || userProposal === void 0 ? void 0 : userProposal.rules) === null || _c === void 0 ? void 0 : _c.profile) === access_control_enum_1.ProfileType.Master)) return [3 /*break*/, 3];
                        return [4 /*yield*/, proposalRepository_1.default.find({ stage: { $gt: 0 }, })
                                .where('type')
                                .equals(query)
                                .populate('user', proposalUserFields)
                                .populate('locator')
                                .populate('proponent')
                                .populate('organization')];
                    case 2: return [2 /*return*/, _d.sent()];
                    case 3: return [4 /*yield*/, proposalRepository_1.default.find(search)
                            .where('type')
                            .equals(query)
                            .populate('user', proposalUserFields)
                            .populate('locator')
                            .populate('proponent')];
                    case 4: return [2 /*return*/, _d.sent()];
                }
            });
        });
    };
    ProposalService.prototype.createProposalParts = function (proposal) {
        return __awaiter(this, void 0, void 0, function () {
            var proponentData, locatorData, proponent, locator, user, userRequest, organization, customerFind, name_1, phone, personType, customerFind, name_2, phone, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 16, , 17]);
                        proponentData = {};
                        locatorData = {};
                        proponent = proposal.proponent, locator = proposal.locator, user = proposal.user;
                        return [4 /*yield*/, userService_1.default.getById(user)];
                    case 1:
                        userRequest = _a.sent();
                        organization = userRequest === null || userRequest === void 0 ? void 0 : userRequest.organization;
                        if (!proponent) return [3 /*break*/, 8];
                        return [4 /*yield*/, customerRepository_1.default.find({
                                email: proponent.email,
                            })];
                    case 2:
                        customerFind = _a.sent();
                        if (!((customerFind === null || customerFind === void 0 ? void 0 : customerFind.length) && !!customerFind[0])) return [3 /*break*/, 6];
                        name_1 = proponent.name, phone = proponent.phone, personType = proponent.personType;
                        return [4 /*yield*/, customerService_2.default.update(customerFind[0]._id, {
                                name: name_1,
                                phone: phone,
                                personType: personType,
                            })];
                    case 3:
                        _a.sent();
                        if (!!customerFind[0].type.includes(customer_type_enum_1.CustomerType.Proponent)) return [3 /*break*/, 5];
                        customerFind[0].type.push(customer_type_enum_1.CustomerType.Proponent);
                        return [4 /*yield*/, customerFind[0].save()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        proponentData = customerFind[0];
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, customerService_1.default.create(__assign(__assign({}, proponent), { type: [customer_type_enum_1.CustomerType.Proponent], user: user,
                            organization: organization }))];
                    case 7:
                        proponentData = _a.sent();
                        _a.label = 8;
                    case 8:
                        if (!locator) return [3 /*break*/, 15];
                        return [4 /*yield*/, customerRepository_1.default.find({
                                email: proponent.email,
                            })];
                    case 9:
                        customerFind = _a.sent();
                        if (!((customerFind === null || customerFind === void 0 ? void 0 : customerFind.length) && !!customerFind[0])) return [3 /*break*/, 13];
                        name_2 = locator.name, phone = locator.phone;
                        return [4 /*yield*/, customerService_2.default.update(customerFind[0]._id, {
                                name: name_2,
                                phone: phone,
                            })];
                    case 10:
                        _a.sent();
                        if (!!customerFind[0].type.includes(customer_type_enum_1.CustomerType.Proponent)) return [3 /*break*/, 12];
                        customerFind[0].type.push(customer_type_enum_1.CustomerType.Locator);
                        return [4 /*yield*/, customerFind[0].save()];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12:
                        locatorData = customerFind[0];
                        return [3 /*break*/, 15];
                    case 13: return [4 /*yield*/, customerRepository_1.default.create(__assign(__assign({}, locator), { type: [customer_type_enum_1.CustomerType.Locator], user: user,
                            organization: organization }))];
                    case 14:
                        locatorData = _a.sent();
                        _a.label = 15;
                    case 15: return [2 /*return*/, this.create(__assign(__assign({}, proposal), { proponent: proponentData._id, locator: locatorData._id, organization: organization }))];
                    case 16:
                        error_2 = _a.sent();
                        throw new AppError_1.default("Erro na cria\u00E7\u00E3o da proposta");
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.updateProposalParts = function (_id, proposal, user) {
        return __awaiter(this, void 0, void 0, function () {
            var proponentData, locatorData, proposalDb, proponent, locator, sendMail, customerFind, customerFind, name_3, phone, custType, proposalUpdate, userProposal, userProposal, userProposal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        proponentData = {};
                        locatorData = {};
                        proponent = proposal.proponent, locator = proposal.locator, sendMail = proposal.sendMail;
                        if (!proponent) return [3 /*break*/, 9];
                        return [4 /*yield*/, customerRepository_1.default.find({
                                email: proponent.email,
                            })];
                    case 1:
                        customerFind = _a.sent();
                        if (!((customerFind === null || customerFind === void 0 ? void 0 : customerFind.length) && !!customerFind[0])) return [3 /*break*/, 5];
                        return [4 /*yield*/, customerService_2.default.update(customerFind._id, proponent)];
                    case 2:
                        _a.sent();
                        if (!!customerFind[0].type.includes(customer_type_enum_1.CustomerType.Proponent)) return [3 /*break*/, 4];
                        customerFind[0].type.push(customer_type_enum_1.CustomerType.Proponent);
                        return [4 /*yield*/, customerFind[0].save()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        proponentData = customerFind[0];
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, customerRepository_1.default.create(__assign(__assign({}, proponent), { type: [customer_type_enum_1.CustomerType.Proponent] })).catch(function () {
                            throw new AppError_1.default('Erro ao atualizar a proposta');
                        })];
                    case 6:
                        proponentData = _a.sent();
                        _a.label = 7;
                    case 7: return [4 /*yield*/, this.update(_id, __assign(__assign({}, proposal), { proponent: proponentData._id }))];
                    case 8: return [2 /*return*/, _a.sent()];
                    case 9:
                        if (!locator) return [3 /*break*/, 22];
                        return [4 /*yield*/, this.update(_id, locator)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.getById(_id)];
                    case 11:
                        proposalDb = _a.sent();
                        return [4 /*yield*/, customerRepository_1.default.find({
                                email: locator.email,
                            })];
                    case 12:
                        customerFind = _a.sent();
                        if (!((customerFind === null || customerFind === void 0 ? void 0 : customerFind.length) && !!customerFind[0])) return [3 /*break*/, 18];
                        name_3 = locator.name, phone = locator.phone;
                        return [4 /*yield*/, customerService_2.default.update(customerFind[0]._id, {
                                name: name_3,
                                phone: phone,
                            })];
                    case 13:
                        _a.sent();
                        if (!(proposalDb.type === proposal_type_enum_1.ProposalType.Aluguel &&
                            !customerFind[0].type.includes(customer_type_enum_1.CustomerType.Locator))) return [3 /*break*/, 15];
                        customerFind[0].type.push(customer_type_enum_1.CustomerType.Locator);
                        return [4 /*yield*/, customerFind[0].save()];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15:
                        if (!(proposalDb.type === proposal_type_enum_1.ProposalType.CompraVenda &&
                            !customerFind[0].type.includes(customer_type_enum_1.CustomerType.Salesman))) return [3 /*break*/, 17];
                        customerFind[0].type.push(customer_type_enum_1.CustomerType.Salesman);
                        return [4 /*yield*/, customerFind[0].save()];
                    case 16:
                        _a.sent();
                        _a.label = 17;
                    case 17:
                        locatorData = customerFind[0];
                        return [3 /*break*/, 20];
                    case 18:
                        custType = proposalDb.type === proposal_type_enum_1.ProposalType.CompraVenda
                            ? customer_type_enum_1.CustomerType.Salesman
                            : customer_type_enum_1.CustomerType.Locator;
                        return [4 /*yield*/, customerRepository_1.default.create(__assign(__assign({}, locator), { type: [custType], user: user }))];
                    case 19:
                        locatorData = _a.sent();
                        _a.label = 20;
                    case 20: return [4 /*yield*/, this.update(_id, __assign(__assign({}, proposal), { locator: locatorData._id }))];
                    case 21: return [2 /*return*/, _a.sent()];
                    case 22: return [4 /*yield*/, this.update(_id, __assign({}, proposal))];
                    case 23:
                        proposalUpdate = _a.sent();
                        if (!proposal.editProposal) return [3 /*break*/, 25];
                        return [4 /*yield*/, userService_1.default.getById(user)];
                    case 24:
                        userProposal = _a.sent();
                        if (sendMail && proposal) {
                            this.sendMailEditProposal(proposalUpdate, userProposal);
                        }
                        else {
                            this.noSendMailEditProposal(proposalUpdate, userProposal);
                        }
                        return [3 /*break*/, 29];
                    case 25:
                        if (!(sendMail && proposal)) return [3 /*break*/, 27];
                        return [4 /*yield*/, userService_1.default.getById(user)];
                    case 26:
                        userProposal = _a.sent();
                        if (proposalUpdate.type === proposal_type_enum_1.ProposalType.Aluguel) {
                            this.sendMailCreateProposalRent(proposalUpdate, userProposal);
                        }
                        else {
                            this.sendMailCreateProposalBuySell(proposalUpdate, userProposal);
                        }
                        return [3 /*break*/, 29];
                    case 27:
                        if (!(sendMail === false)) return [3 /*break*/, 29];
                        return [4 /*yield*/, userService_1.default.getById(user)];
                    case 28:
                        userProposal = _a.sent();
                        this.noSendMailUser(proposalUpdate, userProposal);
                        _a.label = 29;
                    case 29: return [2 /*return*/, proposalUpdate];
                }
            });
        });
    };
    ProposalService.prototype.getByCustomer = function (customerId) {
        return __awaiter(this, void 0, void 0, function () {
            var Customer, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, customerService_1.default.getById(customerId)];
                    case 1:
                        Customer = _a.sent();
                        if (!Customer) {
                            throw new AppError_1.default("Cliente n\u00E3o encontrado");
                        }
                        return [4 /*yield*/, proposalRepository_1.default.find()
                                .or([{ locator: customerId }, { proponent: customerId }])
                                .populate('locator')
                                .populate('proponent')
                                .populate('user', ['name'])];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_3 = _a.sent();
                        throw new AppError_1.default("Problema ao carregar as propostas");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.SendMailByStage = function (stageUpdate, proposal, userDB) {
        switch (stageUpdate) {
            case proposal_stage_enum_1.ProposalStage.Contrato:
                proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                    ? this.sendMailDocToContract(proposal, userDB)
                    : this.sendMailDocToDueDiligence(proposal, userDB);
                break;
            case proposal_stage_enum_1.ProposalStage.Vistoria:
                proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                    ? this.sendMailContractToInspection(proposal, userDB)
                    : this.sendMailDueDiligenceToContract(proposal, userDB);
                break;
            case proposal_stage_enum_1.ProposalStage.EntregaChaves:
                proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                    ? this.sendMailInspectionToKeyDelivery(proposal, userDB)
                    : this.sendMailContractToKeysProperties(proposal, userDB);
                break;
            case proposal_stage_enum_1.ProposalStage.Conclusao:
                proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                    ? this.sendMailKeyDeliveryConclusion(proposal, userDB)
                    : this.sendMailKeysPropertiesConclusion(proposal, userDB);
                break;
            default:
                break;
        }
    };
    ProposalService.prototype.sendMailCreateProposalRent = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: userProposal.email,
                            to: locator.email,
                            subject: "Ol\u00E1, temos uma proposta de " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel ? 'locação' : 'compra e venda') + "  para o seu im\u00F3vel!",
                            message: "\n      " + locator.name + ", boas not\u00EDcias!\n      <br><br>\n      Acabamos de conseguir uma proposta para o seu im\u00F3vel, para acess\u00E1-la, basta clicar no link abaixo. Nele, voc\u00EA ter\u00E1 acesso \u00E0s condi\u00E7\u00F5es ofertadas e poder\u00E1 compartilhar a proposta com eventuais participantes na tomada de decis\u00E3o.\n      <br><br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n      <br><br>\n      Neste momento, trataremos das condi\u00E7\u00F5es comerciais e posteriormente, uma vez fechada a negocia\u00E7\u00E3o, ser\u00E3o realizadas todas as an\u00E1lises cadastrais, contrata\u00E7\u00F5es de garantias, enfim, tudo para a seguran\u00E7a da sua loca\u00E7\u00E3o. Ali\u00E1s, esse um grande diferencial nosso, pois al\u00E9m de termos uma jornada de contrata\u00E7\u00E3o 100% digital, um corpo jur\u00EDdico isento e especializado em direito imobili\u00E1rio, integramos todos os servi\u00E7os relativos \u00E0 loca\u00E7\u00E3o para que voc\u00EA n\u00E3o precise enfrentar filas em cart\u00F3rios, gastar tempo e dinheiro com a burocracia, advogados e documenta\u00E7\u00E3o externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua seguran\u00E7a e comodidade. \n      <br><br>\n      Em caso de d\u00FAvida, \u00E9 s\u00F3 entrar em contato.\n      <br><br>\n\n      Bons neg\u00F3cios!\n      <br>\n      Atenciosamente.\n      <br><br>\n\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "<br>\n\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: userProposal.email,
                            to: proponent.email,
                            subject: 'Proposta enviada com sucesso!',
                            message: "\n      \n      " + proponent.name + ", parab\u00E9ns!\n      <br><br>\n      Sua proposta foi enviada, o locador est\u00E1 analisando e em breve retornaremos.\n      <br><br>\n      Para acess\u00E1-la, basta clicar no link abaixo. Nele, voc\u00EA ter\u00E1 acesso \u00E0s condi\u00E7\u00F5es negociadas e poder\u00E1 compartilhar a proposta com eventuais participantes na tomada de decis\u00E3o.\n      <br>\n      <br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n      <br><br>\n      Neste momento, trataremos das condi\u00E7\u00F5es comerciais e posteriormente, uma vez fechada a negocia\u00E7\u00E3o, ser\u00E3o realizadas todas as an\u00E1lises cadastrais, contrata\u00E7\u00F5es de garantias, enfim, tudo para a seguran\u00E7a da sua loca\u00E7\u00E3o. Ali\u00E1s, esse um grande diferencial nosso, pois al\u00E9m de termos uma jornada de contrata\u00E7\u00E3o 100% digital, um corpo jur\u00EDdico isento e especializado em direito imobili\u00E1rio, integramos todos os servi\u00E7os relativos \u00E0 loca\u00E7\u00E3o para que voc\u00EA n\u00E3o precise enfrentar filas em cart\u00F3rios, gastar tempo e dinheiro com a burocracia, advogados e documenta\u00E7\u00E3o externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua seguran\u00E7a e comodidade.\n      <br><br>\n\n      Em breve retorno com uma posi\u00E7\u00E3o sobre a sua proposta.\n      <br>\n      Em caso de d\u00FAvida, \u00E9 s\u00F3 entrar em contato.\n      <br><br>\n      \n      Sucesso em sua negocia\u00E7\u00E3o!<br>\n      Atenciosamente.\n      <br><br>\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "<br><br>\n\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'atendimento@vivalisto.com.br',
                            to: userProposal.email,
                            subject: 'Proposta enviada com sucesso!',
                            message: "\n      \n      " + userProposal.name + ", parab\u00E9ns!\n      <br><br>\n      Excelente, a proposta foi gerada e encaminhada para seus clientes, inquilinos e locadores.\n      <br>\n      <br>\n      Voc\u00EA poder\u00E1 a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alter\u00E1-la e, uma vez fechada a negocia\u00E7\u00E3o, ENVIAR PARA CONTRATA\u00C7\u00C3O, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formaliza\u00E7\u00E3o de forma otimizada e 100% digital, permitindo que voc\u00EA continue focado em atender os seus clientes e em fazer mais neg\u00F3cios.\n      <br><br>\n      O link abaixo direcionar\u00E1 voc\u00EA ou seus clientes para a visualiza\u00E7\u00E3o da proposta, dessa forma, poder\u00E1 compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negocia\u00E7\u00E3o.\n      <br><br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n\n      Im\u00F3vel: " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "<br>\n      Proponente: " + proponent.name + "\n      <br>\n      Locador: " + locator.name + "\n      <br><br>\n      Bons neg\u00F3cios e sucesso em sua negocia\u00E7\u00E3o!\n      <br>\n      Atenciosamente.\n      <br>\n      <br>\n      Equipe de Suporte<br><br>\n\n      powered by Vivalisto Proptech    \n      \n      ",
                        });
                        if (followers === null || followers === void 0 ? void 0 : followers.length) {
                            followers.forEach(function (follower) {
                                sendMail_1.sendMailUtil({
                                    from: userProposal.email,
                                    to: follower,
                                    subject: 'Acompanhar proposta',
                                    message: "\n          Ol\u00E1,\n          <br><br>\n          Voc\u00EA foi adicionado para acompanhar a proposta. Para acess\u00E1-la, basta clicar no link abaixo. Nele, voc\u00EA ter\u00E1 acesso \u00E0s condi\u00E7\u00F5es ofertadas e poder\u00E1 compartilhar a proposta com eventuais participantes na tomada de decis\u00E3o.\n          <br><br>\n          Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n          <br>\n          Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n          <br>\n          Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n          <br><br>\n          Neste momento, trataremos das condi\u00E7\u00F5es comerciais e posteriormente, uma vez fechada a negocia\u00E7\u00E3o, ser\u00E3o realizadas todas as an\u00E1lises cadastrais, contrata\u00E7\u00F5es de garantias, enfim, tudo para a seguran\u00E7a da sua loca\u00E7\u00E3o. Ali\u00E1s, esse um grande diferencial nosso, pois al\u00E9m de termos uma jornada de contrata\u00E7\u00E3o 100% digital, um corpo jur\u00EDdico isento e especializado em direito imobili\u00E1rio, integramos todos os servi\u00E7os relativos \u00E0 loca\u00E7\u00E3o para que voc\u00EA n\u00E3o precise enfrentar filas em cart\u00F3rios, gastar tempo e dinheiro com a burocracia, advogados e documenta\u00E7\u00E3o externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua seguran\u00E7a e comodidade. \n          <br><br>\n          Em caso de d\u00FAvida, \u00E9 s\u00F3 entrar em contato.\n          <br><br>\n          Atenciosamente.\n          <br><br>\n    \n          " + userProposal.name + "<br>\n          CRECI Corretor: " + userProposal.creci + "<br><br>\n          Telefone: " + userProposal.cellphone + "<br>\n          E-mail: " + userProposal.email + "<br><br>\n          " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n          " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci
                                        : '') + "<br>\n    \n          powered by Vivalisto Proptech\n          ",
                                });
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.sendMailCreateProposalBuySell = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: userProposal.email,
                            to: locator.email,
                            subject: "Ol\u00E1, temos uma proposta de compra para o seu im\u00F3vel!",
                            message: "\n      " + locator.name + ", boas not\u00EDcias!\n      <br><br>\n      Acabamos de conseguir uma proposta para o seu im\u00F3vel, para acess\u00E1-la, basta clicar no link abaixo. Nele, voc\u00EA ter\u00E1 acesso \u00E0s condi\u00E7\u00F5es ofertadas e poder\u00E1 compartilhar a proposta com eventuais participantes na tomada de decis\u00E3o.\n      <br><br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n      <br><br>\n      Neste momento, precisamos que analise as condi\u00E7\u00F5es para darmos andamento na negocia\u00E7\u00E3o. N\u00E3o se preocupe que nesta etapa tratamos apenas das condi\u00E7\u00F5es comerciais e posteriormente, uma vez fechada a negocia\u00E7\u00E3o, ser\u00E3o realizadas todas as an\u00E1lises, contratos e tudo o mais necess\u00E1rio para a seguran\u00E7a da sua venda.\n      <br><br>\n      Ali\u00E1s, esse \u00E9 um grande diferencial nosso, pois al\u00E9m de termos uma jornada de contrata\u00E7\u00E3o 100% digital, cuidamos de tudo para voc\u00EA, at\u00E9 da Escritura e do Registro de Im\u00F3veis. Temos um corpo jur\u00EDdico isento e especializado em direito imobili\u00E1rio e processos integrados com uso da tecnologia, para que voc\u00EA n\u00E3o precise enfrentar filas em cart\u00F3rios, gastar tempo e dinheiro com a burocracia, advogados e documenta\u00E7\u00E3o externa, uma vez que cuidamos de tudo para a sua seguran\u00E7a e comodidade.\n      <br><br>\n      Em caso de d\u00FAvida, \u00E9 s\u00F3 entrar em contato.\n      <br><br>\n      Bons neg\u00F3cios!\n      <br>\n      Atenciosamente.\n      <br><br>\n\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "<br>\n\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: userProposal.email,
                            to: proponent.email,
                            subject: 'Proposta enviada com sucesso!',
                            message: "\n      \n      " + proponent.name + ", parab\u00E9ns!\n      <br><br>\n      Sua proposta foi enviada, o vendedor est\u00E1 analisando e em breve retornaremos.\n      <br>\n      <br>\n      Para acess\u00E1-la, basta clicar no link abaixo. Nele, voc\u00EA ter\u00E1 acesso \u00E0s condi\u00E7\u00F5es negociadas e poder\u00E1 compartilhar a proposta com eventuais participantes na tomada de decis\u00E3o.\n      <br>\n      <br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n      <br><br>\n      Neste momento, trataremos das condi\u00E7\u00F5es comerciais e posteriormente, uma vez fechada a negocia\u00E7\u00E3o, ser\u00E3o realizadas todas as an\u00E1lises, contratos e tudo o mais necess\u00E1rio para a seguran\u00E7a da sua compra. Ali\u00E1s, esse \u00E9 um grande diferencial nosso, pois al\u00E9m de termos uma jornada de contrata\u00E7\u00E3o 100% digital, cuidamos de tudo para voc\u00EA, at\u00E9 da Escritura e do Registro de Im\u00F3veis. Temos um corpo jur\u00EDdico isento e especializado em direito imobili\u00E1rio e processos integrados com uso da tecnologia, para que voc\u00EA n\u00E3o precise enfrentar filas em cart\u00F3rios, gastar tempo e dinheiro com a burocracia, advogados e documenta\u00E7\u00E3o externa, uma vez que cuidamos de tudo para a sua seguran\u00E7a e comodidade, at\u00E9 mesmo do cr\u00E9dito imobili\u00E1rio, sem nenhum custo adicional.\n      <br><br>\n      Em breve retorno com uma posi\u00E7\u00E3o sobre a sua proposta.\n      <br>\n      Em caso de d\u00FAvida, \u00E9 s\u00F3 entrar em contato.\n      <br>\n      <br>\n      Sucesso em sua negocia\u00E7\u00E3o!\n      <br>\n      Atenciosamente.\n      <br><br>\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "<br>\n\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'atendimento@vivalisto.com.br',
                            to: userProposal.email,
                            subject: 'Proposta enviada com sucesso!',
                            message: "\n      \n      " + userProposal.name + ", parab\u00E9ns!\n      <br><br>\n      Excelente, a proposta foi gerada e encaminhada para seus clientes, compradores e vendedores.\n      <br>\n      <br>\n      Voc\u00EA poder\u00E1 a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alter\u00E1-la e, uma vez fechada a negocia\u00E7\u00E3o, ENVIAR PARA CONTRATA\u00C7\u00C3O, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formaliza\u00E7\u00E3o de forma otimizada e 100% digital, permitindo que voc\u00EA continue focado em atender os seus clientes e em fazer mais neg\u00F3cios.\n      <br>\n      <br>\n      O link abaixo direcionar\u00E1 voc\u00EA ou seus clientes para a visualiza\u00E7\u00E3o da proposta, dessa forma, poder\u00E1 compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negocia\u00E7\u00E3o.\n      <br>\n      <br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n\n      Im\u00F3vel: " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "<br>\n      Proponente: " + proponent.name + "\n      <br>\n      Vendedor: " + locator.name + "\n      <br><br>\n      Bons neg\u00F3cios e sucesso em sua negocia\u00E7\u00E3o!\n      <br>\n      Atenciosamente.\n      <br>\n      <br>\n      Equipe de Suporte<br><br>\n\n      powered by Vivalisto Proptech    \n      \n      ",
                        });
                        if (followers === null || followers === void 0 ? void 0 : followers.length) {
                            followers.forEach(function (follower) {
                                sendMail_1.sendMailUtil({
                                    from: userProposal.email,
                                    to: follower,
                                    subject: 'Acompanhar proposta',
                                    message: "\n          Ol\u00E1,\n          <br><br>\n          Voc\u00EA foi adicionado para acompanhar a proposta. Para acess\u00E1-la, basta clicar no link abaixo. Nele, voc\u00EA ter\u00E1 acesso \u00E0s condi\u00E7\u00F5es ofertadas e poder\u00E1 compartilhar a proposta com eventuais participantes na tomada de decis\u00E3o.\n          <br><br>\n          Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n          <br>\n          Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n          <br>\n          Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n          <br><br>\n          Neste momento, trataremos das condi\u00E7\u00F5es comerciais e posteriormente, uma vez fechada a negocia\u00E7\u00E3o, ser\u00E3o realizadas todas as an\u00E1lises cadastrais, contrata\u00E7\u00F5es de garantias, enfim, tudo para a seguran\u00E7a da sua loca\u00E7\u00E3o. Ali\u00E1s, esse um grande diferencial nosso, pois al\u00E9m de termos uma jornada de contrata\u00E7\u00E3o 100% digital, um corpo jur\u00EDdico isento e especializado em direito imobili\u00E1rio, integramos todos os servi\u00E7os relativos \u00E0 loca\u00E7\u00E3o para que voc\u00EA n\u00E3o precise enfrentar filas em cart\u00F3rios, gastar tempo e dinheiro com a burocracia, advogados e documenta\u00E7\u00E3o externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua seguran\u00E7a e comodidade. \n          <br><br>\n          Em caso de d\u00FAvida, \u00E9 s\u00F3 entrar em contato.\n          <br><br>\n          Atenciosamente.\n          <br><br>\n    \n          " + userProposal.name + "<br>\n          CRECI Corretor: " + userProposal.creci + "<br><br>\n          Telefone: " + userProposal.cellphone + "<br>\n          E-mail: " + userProposal.email + "<br><br>\n          " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n          " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci
                                        : '') + "<br>\n    \n          powered by Vivalisto Proptech\n          ",
                                });
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.sendMailEditProposal = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: userProposal.email,
                            to: locator.email,
                            subject: "Proposta atualizada para " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'locação'
                                : 'venda') + " de seu im\u00F3vel!",
                            message: "\n      " + locator.name + ", temos novidades!\n      <br><br>\n      Estamos evoluindo na negocia\u00E7\u00E3o para fecharmos o neg\u00F3cio. No link abaixo voc\u00EA ter\u00E1 acesso \u00E0s \u00FAltimas condi\u00E7\u00F5es propostas.\n      <br><br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n      <br><br>\n      Lembrando que neste momento, trataremos das condi\u00E7\u00F5es comerciais e posteriormente, uma vez fechada a negocia\u00E7\u00E3o, ser\u00E3o realizadas todas as an\u00E1lises cadastrais, contrata\u00E7\u00F5es de garantias, enfim, tudo para a seguran\u00E7a da sua loca\u00E7\u00E3o. Ali\u00E1s, esse um grande diferencial nosso, pois al\u00E9m de termos uma jornada de contrata\u00E7\u00E3o 100% digital, um corpo jur\u00EDdico isento e especializado em direito imobili\u00E1rio, integramos todos os servi\u00E7os relativos \u00E0 loca\u00E7\u00E3o para que voc\u00EA n\u00E3o precise enfrentar filas em cart\u00F3rios, gastar tempo edinheiro com a burocracia, advogados e documenta\u00E7\u00E3o externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua seguran\u00E7a e comodidade.\n      <br><br>\n      Caso esteja de acordo, tenha alguma d\u00FAvida ou considera\u00E7\u00E3o a fazer, \u00E9 s\u00F3 entrar em contato ou responder esta mensagem.\n      <br><br>\n      Bons neg\u00F3cios!\n      <br>\n      Atenciosamente.\n      <br><br>\n\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "<br>\n\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: userProposal.email,
                            to: proponent.email,
                            subject: "Proposta atualizada para " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'sua locação!'
                                : 'compra de seu imóvel!') + " ",
                            message: "\n      \n      " + proponent.name + ", temos novidades!\n      <br><br>\n      Estamos evoluindo na negocia\u00E7\u00E3o para fecharmos o neg\u00F3cio. No link abaixo voc\u00EA ter\u00E1 acesso \u00E0s \u00FAltimas condi\u00E7\u00F5es propostas.\n      <br>\n      <br>\n      Para acess\u00E1-la, basta clicar no link abaixo. Nele, voc\u00EA ter\u00E1 acesso \u00E0s condi\u00E7\u00F5es negociadas e poder\u00E1 compartilhar a proposta com eventuais participantes na tomada de decis\u00E3o.\n      <br>\n      <br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n      <br><br>\n      Lembrando que neste momento trataremos das condi\u00E7\u00F5es comerciais e posteriormente, uma vez fechada a negocia\u00E7\u00E3o, ser\u00E3o realizadas todas as an\u00E1lises cadastrais, contrata\u00E7\u00F5es de garantias, enfim, tudo para a seguran\u00E7a da sua loca\u00E7\u00E3o. Ali\u00E1s, esse um grande diferencial nosso, pois al\u00E9m de termos uma jornada de contrata\u00E7\u00E3o 100% digital, um corpo jur\u00EDdico isento e especializado em direito imobili\u00E1rio, integramos todos os servi\u00E7os relativos \u00E0 loca\u00E7\u00E3o para que voc\u00EA n\u00E3o precise enfrentar filas em cart\u00F3rios, gastar tempo e dinheiro com a burocracia, advogados e documenta\u00E7\u00E3o externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua seguran\u00E7a e comodidade.\n      <br><br>\n      Caso esteja de acordo, tenha alguma d\u00FAvida ou considera\u00E7\u00E3o a fazer, \u00E9 s\u00F3 entrar em contato ou responder esta mensagem.\n      <br>\n      Em caso de d\u00FAvida, \u00E9 s\u00F3 entrar em contato.\n      <br>\n      <br>\n      Atenciosamente.\n      <br><br>\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "<br>\n\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'atendimento@vivalisto.com.br',
                            to: userProposal.email,
                            subject: 'Proposta alterada com sucesso!',
                            message: "\n      \n      " + userProposal.name + ", muito bem!\n      <br><br>\n      Estamos evoluindo, a proposta foi alterada e encaminhada para seus clientes, " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? ' inquilinos e locadores.'
                                : 'compradores e vendedores.') + "\n      <br>\n      <br>\n      \u00C9 importante \u201Cn\u00E3o deixar o neg\u00F3cio esfriar\u201D, fa\u00E7a o acompanhamento junto aos seus clientes e esteja pr\u00F3ximo para responder \u00E0s suas d\u00FAvidas e anseios, atuando de forma consultiva para chegar \u00E0 um bom termo com ambas as partes.\n      <br>\n      <br>\n      Voc\u00EA poder\u00E1 a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alter\u00E1-la e, uma vez fechada a negocia\u00E7\u00E3o, ENVIAR PARA CONTRATA\u00C7\u00C3O, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formaliza\u00E7\u00E3o de forma otimizada e 100% digital, permitindo que voc\u00EA continue focado em atender os seus clientes e em fazer mais neg\u00F3cios.\n      <br>\n      <br>\n      O link abaixo direcionar\u00E1 voc\u00EA ou seus clientes para a visualiza\u00E7\u00E3o da proposta, dessa forma, poder\u00E1 compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negocia\u00E7\u00E3o.      \n      <br>\n      <br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n\n      Im\u00F3vel: " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "<br>\n      Proponente: " + proponent.name + "\n      <br>\n      " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locador'
                                : 'Vendedor') + ": " + locator.name + "\n      <br><br>\n      Bons neg\u00F3cios e sucesso em sua negocia\u00E7\u00E3o!\n      <br>\n      Atenciosamente.\n      <br>\n      <br>\n      Equipe de Suporte<br><br>\n\n      powered by Vivalisto Proptech    \n      \n      ",
                        });
                        if (followers === null || followers === void 0 ? void 0 : followers.length) {
                            followers.forEach(function (follower) {
                                sendMail_1.sendMailUtil({
                                    from: userProposal.email,
                                    to: follower,
                                    subject: 'Acompanhar proposta',
                                    message: "\n          Ol\u00E1,\n          <br><br>\n          Voc\u00EA foi adicionado para acompanhar a proposta. Para acess\u00E1-la, basta clicar no link abaixo. Nele, voc\u00EA ter\u00E1 acesso \u00E0s condi\u00E7\u00F5es ofertadas e poder\u00E1 compartilhar a proposta com eventuais participantes na tomada de decis\u00E3o.\n          <br><br>\n          Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n          <br>\n          Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n          <br>\n          Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n          <br><br>\n          Neste momento, trataremos das condi\u00E7\u00F5es comerciais e posteriormente, uma vez fechada a negocia\u00E7\u00E3o, ser\u00E3o realizadas todas as an\u00E1lises cadastrais, contrata\u00E7\u00F5es de garantias, enfim, tudo para a seguran\u00E7a da sua loca\u00E7\u00E3o. Ali\u00E1s, esse um grande diferencial nosso, pois al\u00E9m de termos uma jornada de contrata\u00E7\u00E3o 100% digital, um corpo jur\u00EDdico isento e especializado em direito imobili\u00E1rio, integramos todos os servi\u00E7os relativos \u00E0 loca\u00E7\u00E3o para que voc\u00EA n\u00E3o precise enfrentar filas em cart\u00F3rios, gastar tempo e dinheiro com a burocracia, advogados e documenta\u00E7\u00E3o externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua seguran\u00E7a e comodidade. \n          <br><br>\n          Em caso de d\u00FAvida, \u00E9 s\u00F3 entrar em contato.\n          <br><br>\n          Atenciosamente.\n          <br><br>\n    \n          " + userProposal.name + "<br>\n          CRECI Corretor: " + userProposal.creci + "<br><br>\n          Telefone: " + userProposal.cellphone + "<br>\n          E-mail: " + userProposal.email + "<br><br>\n          " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n          " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci
                                        : '') + "<br>\n    \n          powered by Vivalisto Proptech\n          ",
                                });
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.noSendMailEditProposal = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: 'atendimento@vivalisto.com.br',
                            to: userProposal.email,
                            subject: 'Proposta alterada com sucesso!',
                            message: "\n      \n      " + userProposal.name + ", muito bem!\n      <br><br>\n      A proposta foi alterada, mas lembre-se, como solicitado por voc\u00EA, n\u00E3o foi encaminhada para seus clientes, " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? ' inquilinos e locadores.'
                                : 'compradores e vendedores.') + "\n      <br>\n      <br>\n      Voc\u00EA poder\u00E1 a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alter\u00E1-la e, uma vez fechada a negocia\u00E7\u00E3o, ENVIAR PARA CONTRATA\u00C7\u00C3O, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formaliza\u00E7\u00E3o de forma otimizada e 100% digital, permitindo que voc\u00EA continue focado em atender os seus clientes e em fazer mais neg\u00F3cios.\n      <br>\n      <br>\n      O link abaixo direcionar\u00E1 voc\u00EA ou seus clientes para a visualiza\u00E7\u00E3o da proposta, dessa forma, poder\u00E1 compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negocia\u00E7\u00E3o.      \n      <br>\n      <br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n\n      Im\u00F3vel: " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "<br>\n      Proponente: " + proponent.name + "\n      <br>\n      " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locador'
                                : 'Vendedor') + ": " + locator.name + "\n      <br><br>\n      Bons neg\u00F3cios e sucesso em sua negocia\u00E7\u00E3o!\n      <br>\n      Atenciosamente.\n      <br>\n      <br>\n      Equipe de Suporte<br><br>\n\n      powered by Vivalisto Proptech    \n      \n      ",
                        });
                        if (followers === null || followers === void 0 ? void 0 : followers.length) {
                            followers.forEach(function (follower) {
                                sendMail_1.sendMailUtil({
                                    from: userProposal.email,
                                    to: follower,
                                    subject: 'Proposta atualizada',
                                    message: "\n          Ol\u00E1,\n          <br><br>\n          Voc\u00EA foi adicionado para acompanhar a proposta. Para acess\u00E1-la, basta clicar no link abaixo. Nele, voc\u00EA ter\u00E1 acesso \u00E0s condi\u00E7\u00F5es ofertadas e poder\u00E1 compartilhar a proposta com eventuais participantes na tomada de decis\u00E3o.\n          <br><br>\n          Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n          <br>\n          Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n          <br>\n          Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n          <br><br>\n          Neste momento, trataremos das condi\u00E7\u00F5es comerciais e posteriormente, uma vez fechada a negocia\u00E7\u00E3o, ser\u00E3o realizadas todas as an\u00E1lises cadastrais, contrata\u00E7\u00F5es de garantias, enfim, tudo para a seguran\u00E7a da sua loca\u00E7\u00E3o. Ali\u00E1s, esse um grande diferencial nosso, pois al\u00E9m de termos uma jornada de contrata\u00E7\u00E3o 100% digital, um corpo jur\u00EDdico isento e especializado em direito imobili\u00E1rio, integramos todos os servi\u00E7os relativos \u00E0 loca\u00E7\u00E3o para que voc\u00EA n\u00E3o precise enfrentar filas em cart\u00F3rios, gastar tempo e dinheiro com a burocracia, advogados e documenta\u00E7\u00E3o externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua seguran\u00E7a e comodidade. \n          <br><br>\n          Em caso de d\u00FAvida, \u00E9 s\u00F3 entrar em contato.\n          <br><br>\n          Atenciosamente.\n          <br><br>\n    \n          " + userProposal.name + "<br>\n          CRECI Corretor: " + userProposal.creci + "<br><br>\n          Telefone: " + userProposal.cellphone + "<br>\n          E-mail: " + userProposal.email + "<br><br>\n          " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n          " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci
                                        : '') + "<br>\n    \n          powered by Vivalisto Proptech\n          ",
                                });
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.noSendMailUser = function (proposal, userProposal) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _d.sent();
                        sendMail_1.sendMailUtil({
                            from: 'atendimento@vivalisto.com.br',
                            to: userProposal.email,
                            subject: 'Proposta gerada com sucesso!',
                            message: "\n      \n      " + userProposal.name + ", parab\u00E9ns!\n      <br><br>\n      Excelente, a proposta foi gerada, mas como solicitado por voc\u00EA, n\u00E3o foi encaminhada para seus clientes, " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'inquilinos e locadores'
                                : 'compradores e vendedores.') + ".\n      <br>\n      <br>\n      Voc\u00EA poder\u00E1 a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alter\u00E1-la e, uma vez fechada a negocia\u00E7\u00E3o, ENVIAR PARA CONTRATA\u00C7\u00C3O, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formaliza\u00E7\u00E3o de forma otimizada e 100% digital, permitindo que voc\u00EA continue focado em atender os seus clientes e em fazer mais neg\u00F3cios.\n      <br><br>\n      O link abaixo direcionar\u00E1 voc\u00EA ou seus clientes para a visualiza\u00E7\u00E3o da proposta, dessa forma, poder\u00E1 compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negocia\u00E7\u00E3o.\n      <br><br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n\n      Im\u00F3vel: " + ((_a = proposal === null || proposal === void 0 ? void 0 : proposal.immobile) === null || _a === void 0 ? void 0 : _a.publicPlace) + ", " + ((_b = proposal === null || proposal === void 0 ? void 0 : proposal.immobile) === null || _b === void 0 ? void 0 : _b.number) + " - " + ((_c = proposal === null || proposal === void 0 ? void 0 : proposal.immobile) === null || _c === void 0 ? void 0 : _c.city) + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "<br>\n      Proponente: " + (proponent === null || proponent === void 0 ? void 0 : proponent.name) + "\n      <br>\n      " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locador'
                                : 'Comprador') + ": " + (locator === null || locator === void 0 ? void 0 : locator.name) + "\n      <br><br>\n      Bons neg\u00F3cios e sucesso em sua negocia\u00E7\u00E3o!\n      <br>\n      Atenciosamente.\n      <br>\n      <br>\n      Equipe de Suporte<br><br>\n\n      powered by Vivalisto Proptech    \n      \n      ",
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.sendMailApproveRentBuySell = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: userProposal.email,
                            to: locator.email,
                            subject: "Parab\u00E9ns pelo sucesso na negocia\u00E7\u00E3o!",
                            message: "\n      " + locator.name + ", parab\u00E9ns!\n      <br><br>\n      Estamos felizes pelo sucesso da negocia\u00E7\u00E3o!\n      <br><br>\n      Daqui em diante, nossa equipe de contratos cuidar\u00E1 de tudo e em breve entrar\u00E3o em contato para o procedimentos de contrata\u00E7\u00E3o.\n      <br><br>\n      Voc\u00EA poder\u00E1 acessar as condi\u00E7\u00F5es negociadas sempre que preciso, para isto basta clicar no link abaixo:\n      <br><br>\n      Para acessar a proposta " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'de locação'
                                : 'venda do imóvel') + ", <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n      <br><br>\n      Agradecemos a confian\u00E7a e desejamos sucesso em sua nova loca\u00E7\u00E3o.\n      <br><br>\n      Em caso de d\u00FAvidas, \u00E9 s\u00F3 entrar em contato.\n      <br>\n      Atenciosamente.\n      <br>\n      <br>\n      Atenciosamente.\n      <br><br>\n\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: userProposal.email,
                            to: proponent.email,
                            subject: 'Parabéns pelo sucesso na negociação!',
                            message: "\n      \n      " + proponent.name + ", parab\u00E9ns!\n      <br><br>\n      Estamos felizes pelo sucesso da negocia\u00E7\u00E3o!\n      <br>\n      <br>\n      Daqui em diante, nossa equipe de contratos cuidar\u00E1 de tudo e em breve entrar\u00E3o em contato para os procedimentos de contrata\u00E7\u00E3o.      \n      <br>\n      Voc\u00EA poder\u00E1 acessar as condi\u00E7\u00F5es negociadas sempre que preciso, para isto basta clicar no link abaixo:\n      <br>\n      <br>\n      Para acessar a " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'de locação'
                                : 'venda do imóvel') + ", <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n      <br><br>\n      Agradecemos a confian\u00E7a e desejamos sucesso em sua nova loca\u00E7\u00E3o.\n      <br><br>\n      Em caso de d\u00FAvidas, \u00E9 s\u00F3 entrar em contato.\n      <br>\n      Atenciosamente.\n      <br><br>\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "<br>\n\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'atendimento@vivalisto.com.br',
                            to: userProposal.email,
                            subject: "Parab\u00E9ns pela " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel ? 'locação' : 'venda') + " do im\u00F3vel " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      \n      " + userProposal.name + ", bom trabalho!\n      <br><br>\n      Que bom que tenha conseguido chegar em bons termos entre " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'inquilinos e locadores!'
                                : 'compradores e vendedores!') + " Agora, para concluir o processo de loca\u00E7\u00E3o, voc\u00EA precisa entrar no sistema e, em MINHAS NEGOCIA\u00C7\u00D5ES, selecionar a proposta fechada e clicar em ENVIAR PARA CONTRATA\u00C7\u00C3O, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formaliza\u00E7\u00E3o de forma otimizada e 100% digital, dessa forma, voc\u00EA ficar\u00E1 livre para dar sequ\u00EAncia no atendimento de novos clientes e fazer mais neg\u00F3cios.\n      <br>\n      <br>\n      N\u00E3o deixe seus clientes esperando, se ainda n\u00E3o ENVIOU PARA CONTRATA\u00C7\u00C3O, acesse o sistema e a proposta fechada clicando aqui:\n      <br>\n      <a href=" + api_1.apiServer.prod + "> Acesso ao sistema </a>\n      <br>\n      O link abaixo direcionar\u00E1 voc\u00EA ou seus clientes para a visualiza\u00E7\u00E3o da proposta, dessa forma, poder\u00E1 compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negocia\u00E7\u00E3o.\n      <br>\n      Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n      <br>\n      <br>\n      Im\u00F3vel: " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "<br>\n      Proponente: " + proponent.name + "\n      <br>\n      " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel ? 'Locador' : 'Vendedor') + ": " + locator.name + "\n      <br><br>\n      Bons neg\u00F3cios e sucesso em sua negocia\u00E7\u00E3o!\n      Atenciosamente.\n      <br>\n      <br>\n      Equipe de Suporte<br><br>\n\n      powered by Vivalisto Proptech    \n      \n      ",
                        });
                        if (followers === null || followers === void 0 ? void 0 : followers.length) {
                            followers.forEach(function (follower) {
                                sendMail_1.sendMailUtil({
                                    to: follower,
                                    subject: 'Acompanhar proposta',
                                    message: "\n      \n          " + proponent.name + ", parab\u00E9ns!\n          <br><br>\n          Estamos felizes pelo sucesso da negocia\u00E7\u00E3o!\n          <br>\n          <br>\n          Daqui em diante, nossa equipe de contratos cuidar\u00E1 de tudo e em breve entrar\u00E3o em contato para os procedimentos de contrata\u00E7\u00E3o.      \n          <br>\n          Voc\u00EA poder\u00E1 acessar as condi\u00E7\u00F5es negociadas sempre que preciso, para isto basta clicar no link abaixo:\n          <br>\n          <br>\n          Para acessar a proposta, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, N\u00FAmero da proposta: " + proposal.seq + " </a>\n          <br>\n          Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n          <br>\n          Im\u00F3vel: <bold>" + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + "</bold>\n          <br><br>\n          Agradecemos a confian\u00E7a e desejamos sucesso em sua nova " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel ? 'locação' : 'venda') + ".\n          <br><br>\n          Em caso de d\u00FAvidas, \u00E9 s\u00F3 entrar em contato.\n          <br>\n          Atenciosamente.\n          <br><br>\n          " + userProposal.name + "<br>\n          CRECI Corretor: " + userProposal.creci + "<br><br>\n          Telefone: " + userProposal.cellphone + "<br>\n          E-mail: " + userProposal.email + "<br><br>\n          " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n          " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci
                                        : '') + "<br>\n    \n          powered by Vivalisto Proptech\n          ",
                                });
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.sendMailHire = function (proposal, user) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, userProposal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        return [4 /*yield*/, userService_1.default.getById(proposal.user.id)];
                    case 1:
                        userProposal = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: userProposal.email,
                            subject: proposal.seq + ", " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locação'
                                : 'Venda') + ", " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      Ol\u00E1, " + userProposal.name + "!\n      <br><br>\n      Mais um neg\u00F3cio fechado!\n      <br><br>\n      A Equipe de Contratos Vivalisto cuidar\u00E1 de todo o processo de contrata\u00E7\u00E3o e contar\u00E1 com o seu apoio para responder pela imobili\u00E1ria quanto \u00E0s quest\u00F5es de sua responsabilidade, como recebimentos de comiss\u00F5es entre outras, as quais ser\u00E3o solicitadas no decorrer das etapas.\n      <br><br>\n      Abaixo, seguem as informa\u00E7\u00F5es consolidadas da negocia\u00E7\u00E3o, cujo processo de contrata\u00E7\u00E3o poder\u00E1 ser acessado a qualquer momento na Plataforma Vivalisto, em MINHAS CONTRATA\u00C7\u00D5ES.\n      <br><br>\n      Para acessar a proposta " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'de locação'
                                : 'venda do imóvel') + ", <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n      <br>\n      Responsabilidade de envio de documentos e informa\u00E7\u00F5es complementares:\n      <br>\n      - " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Inquilinos'
                                : 'Compradores') + "\n      <br> \n      - " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locadores'
                                : 'Vendedores') + "\n      <br>\n      " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Administração da Locação: "imobiliari/ locador/ terceiro" <br>'
                                : '<br>') + "\n      \n      <br>\n      Outras Informa\u00E7\u00F5es Importantes para a Contrata\u00E7\u00E3o: \"comentario modal\"\n      <br><br>\n      Assim como voc\u00EA, os clientes j\u00E1 foram acionados para o andamento da contrata\u00E7\u00E3o, caso sejam eles os respons\u00E1veis pelo envio das informa\u00E7\u00F5es complementares e da documenta\u00E7\u00E3o.\n      <br>\n      Enviaremos em breve os pr\u00F3ximos passos, mas caso precise de algo \u00E9 s\u00F3 falar com o seu Gestor de Contratos Vivalisto.\n      <br>\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de contratos\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: user.email,
                            subject: proposal.seq + ", " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locação'
                                : 'Venda') + ", " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      Ol\u00E1, " + user.name + "!\n      <br><br>\n      Mais um neg\u00F3cio fechado!\n      <br><br>\n      A Equipe de Contratos Vivalisto cuidar\u00E1 de todo o processo de contrata\u00E7\u00E3o e contar\u00E1 com o seu apoio para responder pela imobili\u00E1ria quanto \u00E0s quest\u00F5es de sua responsabilidade, como recebimentos de comiss\u00F5es entre outras, as quais ser\u00E3o solicitadas no decorrer das etapas.\n      <br><br>\n      Abaixo, seguem as informa\u00E7\u00F5es consolidadas da negocia\u00E7\u00E3o, cujo processo de contrata\u00E7\u00E3o poder\u00E1 ser acessado a qualquer momento na Plataforma Vivalisto, em MINHAS CONTRATA\u00C7\u00D5ES.\n      <br><br>\n      Para acessar a proposta " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'de locação'
                                : 'venda do imóvel') + ", <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n      <br>\n      Responsabilidade de envio de documentos e informa\u00E7\u00F5es complementares:\n      <br>\n      - " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Inquilinos'
                                : 'Compradores') + "\n      <br> \n      - " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locadores'
                                : 'Vendedores') + "\n      <br>\n      " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Administração da Locação: "imobiliari/ locador/ terceiro" <br>'
                                : '<br>') + "\n      \n      <br>\n      Outras Informa\u00E7\u00F5es Importantes para a Contrata\u00E7\u00E3o: \"comentario modal\"\n      <br><br>\n      Assim como voc\u00EA, os clientes j\u00E1 foram acionados para o andamento da contrata\u00E7\u00E3o, caso sejam eles os respons\u00E1veis pelo envio das informa\u00E7\u00F5es complementares e da documenta\u00E7\u00E3o.\n      <br>\n      Enviaremos em breve os pr\u00F3ximos passos, mas caso precise de algo \u00E9 s\u00F3 falar com o seu Gestor de Contratos Vivalisto.\n      <br>\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: 'contratos@vivalisto.com.br',
                            subject: proposal.seq + ", " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locação'
                                : 'Venda') + ", " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      \n      Mais um neg\u00F3cio fechado!\n      <br>\n      <br>\n      Abaixo, seguem as informa\u00E7\u00F5es consolidadas da negocia\u00E7\u00E3o, cujo processo de contrata\u00E7\u00E3o poder\u00E1 ser acessado a qualquer momento na Plataforma Vivalisto, em MINHAS CONTRATA\u00C7\u00D5ES.\n      <br><br>\n      Para acessar a proposta " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'de locação'
                                : 'venda do imóvel') + ", <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui, proposta: " + proposal.seq + " </a>\n      <br>\n      <br>\n      Responsabilidade de envio de documentos e informa\u00E7\u00F5es complementares:\n      <br>\n      - " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Inquilinos'
                                : 'Compradores') + "\n      <br> \n      - " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locadores'
                                : 'Vendedores') + "\n      <br>\n      " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Administração da Locação: "imobiliari/ locador/ terceiro" <br>'
                                : '<br>') + "\n\n      <br>\n      Outras Informa\u00E7\u00F5es Importantes para a Contrata\u00E7\u00E3o: \"comentario modal\"\n      <br>      \n      <br>\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: locator.email,
                            subject: proposal.seq + ", " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locação'
                                : 'Venda') + ", " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      \n      Ol\u00E1, " + (locator === null || locator === void 0 ? void 0 : locator.name) + "\n      <br><br>\n      Vamos dar in\u00EDcio ao processo de contrata\u00E7\u00E3o do im\u00F3vel " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + ", Ordem de Servi\u00E7o " + proposal.seq + ".\n      <br><br>\n      A Vivalisto \u00E9 especialista em contratos e processos. Com corpo jur\u00EDdico pr\u00F3prio e isento em rela\u00E7\u00E3o \u00E0s partes da transa\u00E7\u00E3o, aportamos seguran\u00E7a jur\u00EDdica, agilidade e especializa\u00E7\u00E3o em todas as etapas p\u00F3s- negocia\u00E7\u00E3o. Essa \u00E9 uma grande preocupa\u00E7\u00E3o de seu corretor, " + userProposal.name + ", pensando      em sua experi\u00EAncia como cliente e em sua satisfa\u00E7\u00E3o.\n      <br>\n      <br>\n      Agora, precisamos de informa\u00E7\u00F5es complementares \u00E0 sua negocia\u00E7\u00E3o para que o processo caminhe de forma leve e com a devida seguran\u00E7a jur\u00EDdica e operacional. \u00C9 bem simples e pr\u00E1tico! Quanto mais r\u00E1pido responder, mais r\u00E1pido receber\u00E1 o e-mail com instru\u00E7\u00F5es para o envio de sua documenta\u00E7\u00E3o de forma 100% digital. Ap\u00F3s a an\u00E1lise da documenta\u00E7\u00E3o e do(s) proponente(s), seguiremos para a assinatura on- line do contrato, vistoria do im\u00F3vel e entrega das chaves.\n      <br>\n      <br>\n      Para envio das informa\u00E7\u00F5es, <a href='https://share.hsforms.com/1Xfp-eeMASHaXdbX0PlKLLA49vzc'> click aqui </a>\n      <br>\n      <br>\n      Em caso de d\u00FAvida, \u00E9 s\u00F3 entrar em contato pelo e-mail <a> contratos@vivalisto.com.br </a>\n      <br>\n      <br>\n      Atenciosamente.\n      <br>\n      Equipe de Contratos\n      <br><br>\n\n      powered by Vivalisto Proptech    \n      \n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: userProposal.email,
                            subject: proposal.seq + ", " + proposal.seq + ", " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'Locação'
                                : 'Venda') + ", " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      \n      Ol\u00E1, " + (userProposal === null || userProposal === void 0 ? void 0 : userProposal.name) + "\n      <br><br>\n      Vamos dar in\u00EDcio ao processo de " + proposal.seq + ", " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'contratação da locação'
                                : 'contratação da venda') + " do im\u00F3vel, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep + ", Ordem de Servi\u00E7o " + proposal.seq + ".\n      <br><br>\n      Conforme apontado no envio para a contrata\u00E7\u00E3o, voc\u00EA ficou respons\u00E1vel pelo fornecimento dos documentos e informa\u00E7\u00F5es complementares do(s) cliente(s), dessa forma, solicitamos que acesse os links abaixo para a sequ\u00EAncia do processo.\n      <br>\n      <br>\n      " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? "\n          Para envio das informa\u00E7\u00F5es de LOCAT\u00C1RIOS, <a href='https://share.hsforms.com/1Xfp-eeMASHaXdbX0PlKLLA49vzc'> click aqui </a>\n          <br>\n          <br>\n          Para envio das informa\u00E7\u00F5es de LOCADORES, <a href='https://share.hsforms.com/1tW7eVQ-3RmKDzsLvHVXlpw49vzc'> click aqui </a>\n          "
                                :
                                    "\n          Para envio das informa\u00E7\u00F5es de COMPRADORES,, <a href='https://share.hsforms.com/1AIvfShu0QhmegRqm1dCE2g49vzc'> click aqui </a>\n          <br>\n          <br>\n          Para envio das informa\u00E7\u00F5es de VENDEDORES,, <a href='https://share.hsforms.com/1lw5Uk3cvTfKgQxRQVGMrPw49vzc'> click aqui </a>\n          ") + "\n      <br>\n      <br>\n      Enviaremos os pr\u00F3ximos passos na sequ\u00EAncia, mas caso precise de algo \u00E9 s\u00F3 falar com o seu Gestor de Contratos Vivalisto. Lembrando que o processo de contrata\u00E7\u00E3o poder\u00E1 ser acessado a qualquer momento na Plataforma Vivalisto, em MINHAS CONTRATA\u00C7\u00D5ES.\n      <br>\n      <br>\n      Atenciosamente.\n      <br>\n      Equipe de Contratos\n      <br><br>\n\n      powered by Vivalisto Proptech    \n      \n      ",
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    //ALUGUEL
    ProposalService.prototype.sendMailDocToContract = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        followers.push(userProposal.email);
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: locator.email,
                            subject: "Nova Etapa: Contrato - " + proposal.seq + ", Loca\u00E7\u00E3o, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            cc: followers,
                            message: "\n      Ol\u00E1, " + locator.name + "!\n      <br><br>\n      Conclu\u00EDmos o levantamento da documenta\u00E7\u00E3o e realizamos as an\u00E1lises. Tudo correu bem, a loca\u00E7\u00E3o foi aprovada pelo(s) locador(es) e em breve voc\u00EA receber\u00E1 um e-mail para a assinatura de seu contrato de loca\u00E7\u00E3o. Uma vez assinado, realizaremos a vistoria e na sequ\u00EAncia a entrega das chaves.\n      <br><br>\n      Para verificar o status da contrata\u00E7\u00E3o " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'de locação'
                                : 'de venda do imóvel') + ", <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e desejamos sucesso em sua nova loca\u00E7\u00E3o.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      E-mail: contratos@vivalisto.com.br\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: proponent.email,
                            cc: followers,
                            subject: "Nova Etapa: Contrato - " + proposal.seq + ", Loca\u00E7\u00E3o, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      Ol\u00E1, " + proponent.name + "!\n      <br><br>\n      Conclu\u00EDmos o levantamento da documenta\u00E7\u00E3o e realizamos as an\u00E1lises. Tudo correu bem, a loca\u00E7\u00E3o foi aprovada pelo(s) locador(es) e em breve voc\u00EA receber\u00E1 um e-mail para a assinatura de seu contrato de loca\u00E7\u00E3o. Uma vez assinado, realizaremos a vistoria e na sequ\u00EAncia a entrega das chaves.\n      <br><br>\n      Para verificar o status da contrata\u00E7\u00E3o " + (proposal.type === proposal_type_enum_1.ProposalType.Aluguel
                                ? 'de locação'
                                : 'de venda do imóvel') + ", <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e desejamos sucesso em sua nova loca\u00E7\u00E3o.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      E-mail: contratos@vivalisto.com.br\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.sendMailContractToInspection = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        followers.push(userProposal.email);
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: locator.email,
                            subject: "Nova Etapa: Vistoria - " + proposal.seq + ", Loca\u00E7\u00E3o, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            cc: followers,
                            message: "\n      Ol\u00E1, " + locator.name + "!\n      <br><br>\n      Parab\u00E9ns pela contrata\u00E7\u00E3o de sua nova loca\u00E7\u00E3o!\n      <br><br>\n      Seremos \u00E1geis agora na conclus\u00E3o da vistoria, para isso, precisamos de sua ajuda. Para o agendamento da data da vistoria e instru\u00E7\u00F5es para acesso ao im\u00F3vel, pedimos favor acessar o link abaixo e responder as perguntas para que possamos dar andamento.\n      <br><br>\n      Para agendamento da vistoria, <a href='https://share.hsforms.com/1Q7grdolmThioZ-20k-4bzQ49vzc'> click aqui </a>\n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Assim que o laudo for conclu\u00EDdo, enviaremos em seu e-mail para a confer\u00EAncia. Havendo qualquer diverg\u00EAncia, voc\u00EA poder\u00E1 fazer o apontamento, o qual, uma vez validado, ser\u00E1 inclu\u00EDdo no laudo realizado.\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e desejamos sucesso em sua nova loca\u00E7\u00E3o.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      E-mail: contratos@vivalisto.com.br\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: proponent.email,
                            cc: followers,
                            subject: "Nova Etapa: Vistoria - " + proposal.seq + ", Loca\u00E7\u00E3o, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      Ol\u00E1, " + proponent.name + "!\n      <br><br>\n      Parab\u00E9ns pela contrata\u00E7\u00E3o de sua nova loca\u00E7\u00E3o!\n      <br><br>\n      Seremos \u00E1geis agora na conclus\u00E3o da vistoria e assim que o laudo for conclu\u00EDdo o laudo, enviaremos em seu e-mail para a confer\u00EAncia. Havendo qualquer diverg\u00EAncia, voc\u00EA poder\u00E1 fazer o apontamento, o qual, uma vez validado, ser\u00E1 inclu\u00EDdo no laudo realizado.      \n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Estamos quase l\u00E1, ap\u00F3s esta etapa ser\u00E1 feita a entrega das chaves.\n      <br>\n      Em caso de d\u00FAvidas, \u00E9 s\u00F3 entrar em contato.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      E-mail: contratos@vivalisto.com.br\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.sendMailInspectionToKeyDelivery = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        followers.push(userProposal.email);
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: locator.email,
                            subject: "Nova Etapa: Entrega de Chaves - " + proposal.seq + ", Loca\u00E7\u00E3o, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            cc: followers,
                            message: "\n      Ol\u00E1, " + locator.name + "!\n      <br><br>\n      Vistoria conclu\u00EDda, agora \u00E9 s\u00F3 formalizar a entrega de chaves!\n      <br><br>\n      Para que esta Etapa rapidamente, pedimos que acesse o link abaixo para o alinhamento da entrega.\n      <br><br>\n      Para alinhamento da entrega de chaves, <a href='https://share.hsforms.com/1aUYfbox-TDmQiRPlLG_Hqg49vzc'> click aqui </a>\n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Estamos \u00E0 disposi\u00E7\u00E3o para qualquer esclarecimento, bem como, caso ainda n\u00E3o tenha recebido o seu laudo de vistoria, favor nos avisar, respondendo a este e-mail.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: proponent.email,
                            cc: followers,
                            subject: "Nova Etapa: Entrega de Chaves - " + proposal.seq + ", Loca\u00E7\u00E3o, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      Ol\u00E1, " + proponent.name + "!\n      <br><br>\n      Vistoria conclu\u00EDda, agora \u00E9 pegar as chaves!\n      <br>\n      Al\u00E9m deste e-mail, logo mais, voc\u00EA receber\u00E1 um contato de nossa equipe ou do administrador da loca\u00E7\u00E3o para que combinem o recebimento das chaves.\n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Estamos \u00E0 disposi\u00E7\u00E3o para qualquer esclarecimento, bem como, caso ainda n\u00E3o tenha recebido o seu laudo de vistoria, favor nos avisar, respondendo a este e-mail.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      E-mail: contratos@vivalisto.com.br\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.sendMailKeyDeliveryConclusion = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        followers.push(userProposal.email);
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: locator.email,
                            subject: "Nova Etapa: Conclus\u00E3o - " + proposal.seq + ", Loca\u00E7\u00E3o, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            cc: followers,
                            message: "\n      Ol\u00E1, " + locator.name + "!\n      <br><br>\n      Chegamos ao fim de nossa jornada! Esperamos que sua experi\u00EAncia tenha sido realizadora e desejamos sucesso com a nova loca\u00E7\u00E3o.\n      <br><br>\n      \u00C9 nossa miss\u00E3o aportar seguran\u00E7a e efici\u00EAncia nas transa\u00E7\u00F5es imobili\u00E1rias, permitindo que todos os envolvidos tenham um alto n\u00EDvel de satisfa\u00E7\u00E3o com essa opera\u00E7\u00E3o t\u00E3o importante para neg\u00F3cios, fam\u00EDlias e indiv\u00EDduos.\n      <br><br>\n      Para concluir, voc\u00EA receber\u00E1 na sequ\u00EAncia um link para baixar a sua \u201CPASTA JUR\u00CDDICA\u201D, na qual constam todos os documentos de sua transa\u00E7\u00E3o e que ser\u00E3o importantes na administra\u00E7\u00E3o da loca\u00E7\u00E3o, bem como, ao t\u00E9rmino dela, entre outras situa\u00E7\u00F5es que possam demandar estes documentos, dessa forma, indicamos que salve em lugar seguro e que fa\u00E7a ao menos um backup.\n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e nos colocamos \u00E0 disposi\u00E7\u00E3o para auxiliar voc\u00EA em neg\u00F3cios futuros.\n      <br>\n      Atenciosamente.\n      <br><br>\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: proponent.email,
                            cc: followers,
                            subject: "Nova Etapa: Conclus\u00E3o - " + proposal.seq + ", Loca\u00E7\u00E3o, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      Ol\u00E1, " + proponent.name + "!\n      <br><br>\n      Chegamos ao fim de nossa jornada! Esperamos que sua experi\u00EAncia tenha sido realizadora na loca\u00E7\u00E3o de seu novo im\u00F3vel, que tenha muito sucesso e felicidades durante todo o per\u00EDodo da loca\u00E7\u00E3o.\n      <br>\n      \u00C9 nossa miss\u00E3o aportar seguran\u00E7a e efici\u00EAncia nas transa\u00E7\u00F5es imobili\u00E1rias, permitindo que todos os envolvidos tenham um alto n\u00EDvel de satisfa\u00E7\u00E3o com essa opera\u00E7\u00E3o t\u00E3o importante para neg\u00F3cios, fam\u00EDlias e indiv\u00EDduos.\n      <br><br>\n      Para concluir, voc\u00EA receber\u00E1 na sequ\u00EAncia um link para baixar a sua \u201CPASTA JUR\u00CDDICA\u201D, na qual constam todos os documentos de sua transa\u00E7\u00E3o e que ser\u00E3o importantes durante a loca\u00E7\u00E3o, bem como, ao t\u00E9rmino dela, entre outras situa\u00E7\u00F5es que possam demandar estes documentos, dessa forma, indicamos que salve em lugar seguro e que fa\u00E7a ao menos um backup.      \n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e nos colocamos \u00E0 disposi\u00E7\u00E3o para auxiliar voc\u00EA em neg\u00F3cios futuros.\n      <br>\n      Atenciosamente.\n      <br><br>\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    //COMPRA E VENDA
    ProposalService.prototype.sendMailDocToDueDiligence = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        followers.push(userProposal.email);
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: locator.email,
                            subject: "Nova Etapa: Due Diligence - " + proposal.seq + ", Compra e Venda, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            cc: followers,
                            message: "\n      Ol\u00E1, " + locator.name + "!\n      <br><br>\n      Conclu\u00EDmos o levantamento da documenta\u00E7\u00E3o, certid\u00F5es e pesquisas para aportar seguran\u00E7a ao processo de venda de seu im\u00F3vel. Neste momento, nosso corpo jur\u00EDdico est\u00E1 analisando toda a documenta\u00E7\u00E3o, fazendo a \u201CDue Diligence\u201D, a dilig\u00EAncia, como gostamos de chamar.\n      <br><br>\n      Vencida essa etapa, em m\u00E9dia no prazo de at\u00E9 48h \u00FAteis, entraremos em contato com o resultado da Due Diligence para a sua aprecia\u00E7\u00E3o. Na sequ\u00EAncia, ser\u00E1 realizado o Contrato de Compra e Venda, para ent\u00E3o seguirmos para a Etapa de Cart\u00F3rios, onde cuidaremos da Escritura e do Registro do Im\u00F3vel.      \n      <br><br>\n      Para sua comodidade e seguran\u00E7a, cuidaremos de tudo!\n      <br><br>\n      Somos especialistas em direito imobili\u00E1rio e nas etapas que comp\u00F5em toda a transa\u00E7\u00E3o, do in\u00EDcio ao fim de sua contrata\u00E7\u00E3o, atuando de forma isenta entre as partes, pois essa \u00E9 uma grande preocupa\u00E7\u00E3o de seu corretor, " + (userProposal === null || userProposal === void 0 ? void 0 : userProposal.name) + ", pensando em sua experi\u00EAncia como cliente e em sua satisfa\u00E7\u00E3o.      \n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar a proposta, \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e desejamos sucesso em sua nova loca\u00E7\u00E3o.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: proponent.email,
                            cc: followers,
                            subject: "Nova Etapa: Due Diligence - " + proposal.seq + ", Compra e Venda, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      Ol\u00E1, " + proponent.name + "!\n      <br><br>\n      Conclu\u00EDmos o levantamento da documenta\u00E7\u00E3o, certid\u00F5es e pesquisas para aportar seguran\u00E7a ao processo de compra de seu im\u00F3vel. Neste momento, nosso corpo jur\u00EDdico est\u00E1 analisando toda a documenta\u00E7\u00E3o, fazendo a \u201CDue Diligence\u201D, a dilig\u00EAncia, como gostamos de chamar, na qual ser\u00E1 verificada a proced\u00EAncia do im\u00F3vel, se ele est\u00E1 livre e desembara\u00E7ado para a venda, bem como, se o(s) vendedor(es) tem algum restritivo financeiro, fiscal ou judicial que possa colocar em risco a transa\u00E7\u00E3o.\n      <br><br>\n      Vencida essa etapa, em m\u00E9dia no prazo de at\u00E9 48h \u00FAteis, entraremos em contato com o resultado da Due Diligence para a sua aprecia\u00E7\u00E3o. Na sequ\u00EAncia, ser\u00E1 realizado o Contrato de Compra e Venda, para ent\u00E3o seguirmos para a Etapa de Cart\u00F3rios, onde cuidaremos da Escritura e do Registro do Im\u00F3vel.\n      <br><br>\n      Para sua comodidade e seguran\u00E7a, cuidaremos de tudo!      \n      <br><br>\n      Somos especialistas em direito imobili\u00E1rio e nas etapas que comp\u00F5em toda a transa\u00E7\u00E3o, do in\u00EDcio ao fim de sua contrata\u00E7\u00E3o, atuando de forma isenta entre as partes, pois essa \u00E9 uma grande preocupa\u00E7\u00E3o de seu corretor, " + (userProposal === null || userProposal === void 0 ? void 0 : userProposal.name) + ", pensando em sua experi\u00EAncia como cliente e em sua satisfa\u00E7\u00E3o.\n      <br><br>\n\n      Para verificar o status da contrata\u00E7\u00E3o, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e desejamos sucesso em sua nova loca\u00E7\u00E3o.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.sendMailDueDiligenceToContract = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        followers.push(userProposal.email);
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: locator.email,
                            subject: "Nova Etapa: Contrato - " + proposal.seq + ", Venda, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            cc: followers,
                            message: "\n      Ol\u00E1, " + locator.name + "!\n      <br><br>\n      Tudo certo, vamos em frente com o Contrato de Compra e Venda! Em breve, nossa equipe enviar\u00E1 a minuta e coordenar\u00E1 todo o processo de assinatura.\n      <br><br>\n      Conforme explicado anteriormente, temos um corpo jur\u00EDdico pr\u00F3prio, especialista e focado em direito imobili\u00E1rio, isento entre as partes, o que aporta seguran\u00E7a, agilidade e economia em todo o processo, tornando-se desnecess\u00E1rio o envolvimento de advogados e terceiros nesta etapa, pois seu agente imobili\u00E1rio confiou \u00E0 VIVALISTO essa responsabilidade preocupado em aportar especializa\u00E7\u00E3o e seguran\u00E7a jur\u00EDdica e operacional na transa\u00E7\u00E3o de venda de seu im\u00F3vel. Caso ainda queira e tenha contratado um advogado para represent\u00E1-lo nesta etapa, sempre problemas, estamos abertos para tirar todas as d\u00FAvidas e prestar os esclarecimentos necess\u00E1rios para o bom andamento da fase contratual.\n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      <br>\n      Ainda para sua comodidade e seguran\u00E7a, prezamos pela assinatura online, eliminando a necessidade de cart\u00F3rios e papel, o tamb\u00E9m que economiza tempo e dinheiro para todos os envolvidos. Fique tranquilo que voc\u00EA receber\u00E1 todas as instru\u00E7\u00F5es para o procedimento, que \u00E9 simples, r\u00E1pido e seguro.\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e desejamos sucesso em sua nova loca\u00E7\u00E3o.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: proponent.email,
                            cc: followers,
                            subject: "Nova Etapa: Contrato - " + proposal.seq + ", Compra e Venda, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      Ol\u00E1, " + proponent.name + "!\n      <br><br>\n      Conclu\u00EDmos o levantamento da documenta\u00E7\u00E3o, certid\u00F5es e pesquisas para aportar seguran\u00E7a ao processo de compra de seu im\u00F3vel. Neste momento, nosso corpo jur\u00EDdico est\u00E1 analisando toda a documenta\u00E7\u00E3o, fazendo a \u201CDue Diligence\u201D, a dilig\u00EAncia, como gostamos de chamar, na qual ser\u00E1 verificada a proced\u00EAncia do im\u00F3vel, se ele est\u00E1 livre e desembara\u00E7ado para a venda, bem como, se o(s) vendedor(es) tem algum restritivo financeiro, fiscal ou judicial que possa colocar em risco a transa\u00E7\u00E3o.\n      <br><br>\n      Vencida essa etapa, em m\u00E9dia no prazo de at\u00E9 48h \u00FAteis, entraremos em contato com o resultado da Due Diligence para a sua aprecia\u00E7\u00E3o. Na sequ\u00EAncia, ser\u00E1 realizado o Contrato de Compra e Venda, para ent\u00E3o seguirmos para a Etapa de Cart\u00F3rios, onde cuidaremos da Escritura e do Registro do Im\u00F3vel.\n      <br><br>\n      Para sua comodidade e seguran\u00E7a, cuidaremos de tudo!      \n      <br><br>\n      Somos especialistas em direito imobili\u00E1rio e nas etapas que comp\u00F5em toda a transa\u00E7\u00E3o, do in\u00EDcio ao fim de sua contrata\u00E7\u00E3o, atuando de forma isenta entre as partes, pois essa \u00E9 uma grande preocupa\u00E7\u00E3o de seu corretor, " + (userProposal === null || userProposal === void 0 ? void 0 : userProposal.name) + ", pensando em sua experi\u00EAncia como cliente e em sua satisfa\u00E7\u00E3o.\n      <br><br>\n\n      Para verificar o status da contrata\u00E7\u00E3o, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e desejamos sucesso em sua nova loca\u00E7\u00E3o.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.sendMailContractToKeysProperties = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        followers.push(userProposal.email);
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: locator.email,
                            subject: "Nova Etapa: Chaves e Propriedade - " + proposal.seq + ", Venda, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            cc: followers,
                            message: "\n      Ol\u00E1, " + locator.name + "!\n      <br><br>\n      Contrato assinado, agora \u00E9 hora de cuidarmos da fase de Cart\u00F3rios, aqui tamb\u00E9m temos um grande diferencial para voc\u00EA, pois coordenaremos todo o processo, o qual tem detalhes espec\u00EDficos dependendo do tipo de negocia\u00E7\u00E3o, se for com cr\u00E9dito imobili\u00E1rio, parcelamento direto, \u00E0 vista, se h\u00E1 cr\u00E9dito imobili\u00E1rio a ser liquidado, enfim, n\u00E3o se preocupe que estaremos aqui para conduzir os tr\u00E2mites e orient\u00E1-lo nessa jornada.\n      <br><br>\n      Somos pioneiros tamb\u00E9m em Escritura\u00E7\u00E3o Online, o que elimina a necessidade da sess\u00E3o em cart\u00F3rio, bem como, cuidamos de tudo para que o processo ocorra atrav\u00E9s dos meios digitais e com toda a seguran\u00E7a a eles aportada.\n      <br><br>\n      Como citado, esta etapa possu\u00ED diferentes detalhes para cada tipo de transa\u00E7\u00E3o, dessa forma, voc\u00EA receber\u00E1 os direcionamentos de seu Gestor de Contratos Vivalisto em breve, para a sequ\u00EAncia da transfer\u00EAncia da propriedade.      \n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      <br>\n      Ainda para sua comodidade e seguran\u00E7a, prezamos pela assinatura online, eliminando a necessidade de cart\u00F3rios e papel, o tamb\u00E9m que economiza tempo e dinheiro para todos os envolvidos. Fique tranquilo que voc\u00EA receber\u00E1 todas as instru\u00E7\u00F5es para o procedimento, que \u00E9 simples, r\u00E1pido e seguro.\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e desejamos sucesso em sua nova loca\u00E7\u00E3o.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: proponent.email,
                            cc: followers,
                            subject: "Nova Etapa: Chaves e Propriedade - " + proposal.seq + ", Compra e Venda, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      " + proponent.name + ", parab\u00E9ns pela compra de seu novo im\u00F3vel!\n      <br><br>\n      Contrato assinado, agora \u00E9 hora de cuidarmos da fase de Cart\u00F3rios, aqui tamb\u00E9m temos um grande diferencial para voc\u00EA, pois coordenaremos todo o processo, o qual tem detalhes espec\u00EDficos dependendo do tipo de negocia\u00E7\u00E3o, se for com cr\u00E9dito imobili\u00E1rio, parcelamento direto, \u00E0 vista, se h\u00E1 cr\u00E9dito imobili\u00E1rio a ser liquidado, enfim, n\u00E3o se preocupe que estaremos aqui para conduzir os tr\u00E2mites e orient\u00E1-lo nessa jornada.\n      <br><br>\n      Somos pioneiros tamb\u00E9m em Escritura\u00E7\u00E3o Online, o que elimina a necessidade da sess\u00E3o em cart\u00F3rio, bem como, cuidamos de tudo para que o processo ocorra atrav\u00E9s dos meios digitais e com toda a seguran\u00E7a a eles aportada.\n      <br><br>\n      Como citado, esta etapa possu\u00ED diferentes detalhes para cada tipo de transa\u00E7\u00E3o, dessa forma, voc\u00EA receber\u00E1 os direcionamentos de seu Gestor de Contratos Vivalisto em breve, para a sequ\u00EAncia da transfer\u00EAncia da propriedade.\n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Estamos quase l\u00E1! Em caso de d\u00FAvidas, \u00E9 s\u00F3 entrar em contato.\n      <br>\n      Atenciosamente.\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ProposalService.prototype.sendMailKeysPropertiesConclusion = function (proposal, userProposal) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, proponent, followers, organizationDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locator = proposal.locator, proponent = proposal.proponent, followers = proposal.followers;
                        followers.push(userProposal.email);
                        return [4 /*yield*/, organizationService_1.default.getById(proposal.organization)];
                    case 1:
                        organizationDB = _a.sent();
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: locator.email,
                            subject: "Nova Etapa: Conclus\u00E3o - " + proposal.seq + ", Venda, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            cc: followers,
                            message: "\n      Ol\u00E1, " + locator.name + "!\n      <br><br>\n      Chegamos ao fim de nossa jornada! Esperamos que sua experi\u00EAncia tenha sido realizadora e desejamos sucesso em seus novos neg\u00F3cios.\n      <br><br>\n      \u00C9 nossa miss\u00E3o aportar seguran\u00E7a e efici\u00EAncia nas transa\u00E7\u00F5es imobili\u00E1rias, permitindo que todos os envolvidos tenham um alto n\u00EDvel de satisfa\u00E7\u00E3o com essa opera\u00E7\u00E3o t\u00E3o importante para neg\u00F3cios, fam\u00EDlias e indiv\u00EDduos.\n      <br><br>\n      Para concluir, voc\u00EA receber\u00E1 na sequ\u00EAncia um link para baixar a sua \u201CPASTA JUR\u00CDDICA\u201D, na qual constam todos os documentos de sua transa\u00E7\u00E3o, os quais s\u00E3o de grande import\u00E2ncia pois s\u00E3o eles que d\u00E3o validade jur\u00EDdica \u00E0 transa\u00E7\u00E3o, dessa forma, indicamos que salve em lugar seguro e que fa\u00E7a ao menos um backup.      \n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e nos colocamos \u00E0 disposi\u00E7\u00E3o para auxiliar voc\u00EA em neg\u00F3cios futuros.\n      <br>\n      Atenciosamente.\n      <br><br>\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "\n      <br><br>\n      Equipe de Contratos\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        sendMail_1.sendMailUtil({
                            from: 'contratos@vivalisto.com.br',
                            to: proponent.email,
                            cc: followers,
                            subject: "Nova Etapa: Conclus\u00E3o - " + proposal.seq + ", Compra e Venda, " + proposal.immobile.publicPlace + ", " + proposal.immobile.number + " - " + proposal.immobile.city + " - " + proposal.immobile.state + ", " + proposal.immobile.cep,
                            message: "\n      Ol\u00E1, " + proponent.name + ".\n      <br><br>\n      Chegamos ao fim de nossa jornada! Esperamos que sua experi\u00EAncia tenha sido realizadora na compra de seu novo im\u00F3vel, que com ele venha muito sucesso e felicidades.\n      <br><br>\n      \u00C9 nossa miss\u00E3o aportar seguran\u00E7a e efici\u00EAncia nas transa\u00E7\u00F5es imobili\u00E1rias, permitindo que todos os envolvidos tenham um alto n\u00EDvel de satisfa\u00E7\u00E3o com essa opera\u00E7\u00E3o t\u00E3o importante para neg\u00F3cios, fam\u00EDlias e indiv\u00EDduos.\n      <br><br>\n      Para concluir, voc\u00EA receber\u00E1 na sequ\u00EAncia um link para baixar a sua \u201CPASTA JUR\u00CDDICA\u201D, na qual constam todos os documentos de sua transa\u00E7\u00E3o, os quais s\u00E3o de grande import\u00E2ncia pois s\u00E3o eles que d\u00E3o validade jur\u00EDdica \u00E0 transa\u00E7\u00E3o, dessa forma, indicamos que salve em lugar seguro e que fa\u00E7a ao menos um backup.\n      <br><br>\n      Para verificar o status, <a href=" + api_1.apiServer.prod + "/proposal-view/" + proposal._id + "> click aqui </a>\n      <br>\n      Caso deseje compartilhar \u00E9 s\u00F3 copiar e colar este link em seu e-mail ou WhatsApp\n      <br>\n      <br>\n      Agradecemos a confian\u00E7a e nos colocamos \u00E0 disposi\u00E7\u00E3o para auxiliar voc\u00EA em neg\u00F3cios futuros.\n      <br>\n      Atenciosamente.\n      <br><br>\n      " + userProposal.name + "<br>\n      CRECI Corretor: " + userProposal.creci + "<br><br>\n      Telefone: " + userProposal.cellphone + "<br>\n      E-mail: " + userProposal.email + "<br><br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "Imobili\u00E1ria: " + organizationDB.name : '') + "<br>\n      " + ((organizationDB === null || organizationDB === void 0 ? void 0 : organizationDB.name) ? "CRECI Imobili\u00E1ria: " + organizationDB.creci : '') + "\n      <br><br>\n      Equipe de Contratos\n      <br>\n      <br>\n      powered by Vivalisto Proptech\n      ",
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return ProposalService;
}());
exports.default = new ProposalService();
