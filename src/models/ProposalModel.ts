import * as mongoose from 'mongoose';

import { ProposalType } from '../enums/proposal-type.enum';
import { PersonType } from '../enums/person-type.enum';
import { Escrow, EscrowType } from '../enums/escrow.enum';
import { ImmobileType } from '../enums/immobile-type.enum';
import { ProposalStatus } from '../enums/proposal-status.enum';
import { ProposalPackegeType } from '../enums/proposal-packege-type.enum';
import { boolean } from 'yup';

const ImmobileSchema: mongoose.Schema = new mongoose.Schema({
  code: {
    type: Number,
  },
  type: {
    type: String,
    uppercase: true,
    enum: Object.values(ImmobileType),
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

const ValueExchangeSchema: mongoose.Schema = new mongoose.Schema({
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

const PaymentSchema: mongoose.Schema = new mongoose.Schema({
  value: Number,
  type: String,
  amountInput: Number,
  index: String,
  parcels: Number,
});

const PackegeSchema: mongoose.Schema = new mongoose.Schema({
  type: {
    type: String,
    uppercase: true,
    enum: Object.values(ProposalPackegeType),
  },
  main: { type: String, uppercase: true },
  charges: { type: String },
  tax: { type: [String] },
});

const ContractSchema: mongoose.Schema = new mongoose.Schema({
  escrow: {
    type: String,
    enum: Object.values(Escrow),
  },
  escrow_turn: {
    type: Number,
    default: 0,
  },
  escrow_type: {
    type: String,
    uppercase: true,
    enum: Object.values(EscrowType),
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

const ProposalSchema: mongoose.Schema = new mongoose.Schema({
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
    enum: Object.values(ProposalType),
  },
  status: {
    type: String,
    uppercase: true,
    enum: Object.values(ProposalStatus),
    default: ProposalStatus.Pendente,
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
    default: Date.now(),
  },
});

let CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

let counter = mongoose.model('counter', CounterSchema);

ProposalSchema.pre('save', function (next) {
  let proposal: any = this;
  counter
    .findByIdAndUpdate(
      { _id: 'entityId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )
    .then(function (count: any) {
      proposal.seq = count.seq;
      next();
    })
    .catch(function (error) {
      console.error('counter error-> : ' + error);
      throw error;
    });
});

export default ProposalSchema;
