import * as mongoose from 'mongoose';

const ProponentSchema: mongoose.Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  personType: {
    type: String,
    required: true,
    enum: ['PF', 'PJ'],
  },
});

const ImmobileSchema: mongoose.Schema = new mongoose.Schema({
  code: {
    type: Number,
  },
  type: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['COMERCIAL', 'RESIDENCIAL'],
  },
  subtype: {
    type: String,
    required: true,
  },
  cep: {
    type: String,
    required: true,
  },
  publicPlace: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  complement: {
    type: String,
  },
  neighborhood: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
});

const ContractSchema: mongoose.Schema = new mongoose.Schema({
  warranty: {
    type: String,
    required: true,
  },
  warranty_turn: {
    type: Number,
    default: 0,
  },
  warranty_type: {
    type: String,
    default: '',
    uppercase: true,
    enum: ['ALUGUEL', 'PACOTE', ''],
  },
  duration: {
    type: Number,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  payDay: {
    type: Number,
    required: true,
  },
  package: {
    type: Number,
    required: true,
  },
});

const LocatorSchema: mongoose.Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

const proposalStage: mongoose.Schema = new mongoose.Schema({
  stage: {
    type: Number,
    required: true,
    default: 0,
    unique: true,
  },
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
});

const ProposalSchema: mongoose.Schema = new mongoose.Schema({
  stage: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['ALUGUEL', 'COMPRA_VENDA'],
  },
  status: {
    type: String,
    required: true,
    default: 'PENDENTE',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  comments: {
    type: String,
  },
  sendMail: {
    type: Boolean,
    default: false,
  },
  proponent: ProponentSchema,
  immobile: ImmobileSchema,
  contract: ContractSchema,
  locator: LocatorSchema,
  created: {
    type: Date,
    default: Date.now(),
  },
});

export default ProposalSchema;
