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
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = __importStar(require("mongoose"));
var person_type_enum_1 = require("../enums/person-type.enum");
var CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    personType: {
        type: String,
        uppercase: true,
        enum: Object.values(person_type_enum_1.PersonType),
        default: person_type_enum_1.PersonType.PessoaFisica,
    },
    organizationName: {
        type: String,
    },
    activityBranch: {
        type: String,
    },
    type: {
        type: [String],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
    },
});
exports.default = CustomerSchema;
