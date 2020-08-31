import ProposalRepository from '../repositories/proposalRepository';
import * as mongoose from 'mongoose';

import { ProposalStatus } from '../enums/proposal-status.enum';
import { ProposalStage } from '../enums/proposal-stage.enum';
import { query } from 'express';
import AppError from '../errors/AppError';

const proposalUserFields = [
  'name',
  'isBroker',
  'isOrganization',
  'email',
  'cellphone',
  'creci',
];

class ProposalService {
  async create(proposal: any) {
    return await ProposalRepository.create(proposal);
  }

  async get(userId: mongoose.Schema.Types.ObjectId) {
    // const filter = {user: { _id: userId },  }

    return await ProposalRepository.find({
      user: { _id: userId },
    }).populate('user', proposalUserFields);
  }

  async getById(_id: string) {
    return await ProposalRepository.findById(_id); //.populate('user')
  }

  async update(_id: string, proposal: any) {
    return await ProposalRepository.findByIdAndUpdate(_id, proposal, {
      new: true,
    });
  }

  async delete(_id: string) {
    return await ProposalRepository.findByIdAndRemove(_id);
  }

  async updateStatus(_id: string, proposalStatus: any) {
    let proposalUpdate = proposalStatus;

    if (proposalStatus.status === ProposalStatus.EmviadaContratacao) {
      proposalUpdate = { ...proposalStatus, stage: ProposalStage.Documental };
    }

    return await this.update(_id, proposalUpdate);
  }

  async updateStage(proposalId: string, dataStage: any) {
    let proposalUpdate = dataStage;

    if (dataStage.status === ProposalStage.Criacao) {
      throw new AppError(
        'Proposta em contratação. Não é possível retornar para negociação!'
      );
    }

    return await this.update(proposalId, proposalUpdate);
  }

  async getSignings(userId: mongoose.Schema.Types.ObjectId) {
    return await ProposalRepository.find({
      user: { _id: userId },
      stage: { $gt: 0 },
    }).populate('user', proposalUserFields);
  }
}

export default new ProposalService();
