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
var proposal_type_enum_1 = require("../enums/proposal-type.enum");
var escrow_enum_1 = require("../enums/escrow.enum");
var immobile_type_enum_1 = require("../enums/immobile-type.enum");
var proposal_status_enum_1 = require("../enums/proposal-status.enum");
var proposal_packege_type_enum_1 = require("../enums/proposal-packege-type.enum");
var momentTimezone = __importStar(require("moment-timezone"));
var date_fns_tz_1 = require("date-fns-tz");
var brazilTimeZone = 'America/Sao_Paulo';
var utc = date_fns_tz_1.zonedTimeToUtc(Date.now(), momentTimezone.locale());
var ImmobileSchema = new mongoose.Schema({
    code: {
        type: Number,
    },
    type: {
        type: String,
        uppercase: true,
        enum: Object.values(immobile_type_enum_1.ImmobileType),
    },
    subtype: {
        type: String,
    },
    cep: {
        type: String,
    },
    publicPlace: {
        type: String,
    },
    number: {
        type: String,
    },
    complement: {
        type: String,
    },
    neighborhood: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
});
var ValueExchangeSchema = new mongoose.Schema({
    value: {
        type: Number,
    },
    exchange: {
        type: Boolean,
    },
    propertyPrice: {
        type: Number,
    },
    commission: {
        type: Boolean,
    },
    commissionValue: {
        type: Number,
    },
    adreess: {
        type: ImmobileSchema,
    },
});
var PaymentSchema = new mongoose.Schema({
    value: Number,
    type: String,
    amountInput: Number,
    index: String,
    parcels: Number,
});
var PackegeSchema = new mongoose.Schema({
    type: {
        type: String,
        uppercase: true,
        enum: Object.values(proposal_packege_type_enum_1.ProposalPackegeType),
    },
    main: { type: String, uppercase: true },
    charges: { type: String },
    tax: { type: [String] },
});
var ContractSchema = new mongoose.Schema({
    escrow: {
        type: String,
        enum: Object.values(escrow_enum_1.Escrow),
    },
    escrow_turn: {
        type: Number,
        default: 0,
    },
    escrow_type: {
        type: String,
        uppercase: true,
        enum: Object.values(escrow_enum_1.EscrowType),
    },
    duration: {
        type: Number,
    },
    value: {
        type: Number,
    },
    payDay: {
        type: Number,
    },
    package: {
        type: PackegeSchema,
    },
});
var ProposalSchema = new mongoose.Schema({
    stage: {
        type: Number,
        default: 0,
    },
    stageStatus: {
        type: String,
    },
    seq: { type: Number, default: 0, unique: true },
    type: {
        type: String,
        enum: Object.values(proposal_type_enum_1.ProposalType),
    },
    status: {
        type: String,
        uppercase: true,
        enum: Object.values(proposal_status_enum_1.ProposalStatus),
        default: proposal_status_enum_1.ProposalStatus.Pendente,
    },
    completeSteps: {
        type: Number,
        default: 1,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
    },
    comments: {
        type: String,
    },
    sendMail: {
        type: Boolean,
        default: false,
    },
    followers: {
        type: [String],
    },
    immobile: ImmobileSchema,
    contract: ContractSchema,
    valueExchange: ValueExchangeSchema,
    payment: PaymentSchema,
    proponent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer',
    },
    locator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer',
    },
    created: {
        type: Date,
        default: date_fns_tz_1.zonedTimeToUtc(Date.now(), momentTimezone.locale()),
    },
});
var CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});
var counter = mongoose.model('counter', CounterSchema);
ProposalSchema.pre('save', function (next) {
    var proposal = this;
    counter
        .findByIdAndUpdate({ _id: 'entityId' }, { $inc: { seq: 1 } }, { new: true, upsert: true })
        .then(function (count) {
        proposal.seq = count.seq;
        next();
    })
        .catch(function (error) {
        console.error('counter error-> : ' + error);
        throw error;
    });
});
exports.default = ProposalSchema;
