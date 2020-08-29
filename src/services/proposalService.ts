import ProposalRepository from '../repositories/proposalRepository';
import * as mongoose from 'mongoose';

import { ProposalStatus } from '../enums/proposal-status.enum';
import { ProposalStage } from '../enums/proposal-stage.enum';

class ProposalService {
  async create(proposal: any) {
    return await ProposalRepository.create(proposal);
  }

  async get(userId: mongoose.Schema.Types.ObjectId) {
    // const query = {user: { _id: userId }, }

    return await ProposalRepository.find({
      user: { _id: userId },
    }).populate('user', [
      'name',
      'isBroker',
      'isOrganization',
      'email',
      'cellphone',
      'creci',
    ]);
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

    if (proposalStatus.status === ProposalStatus.EmNegociacao) {
      proposalUpdate = { ...proposalStatus, stage: ProposalStage.Documental };
    }

    return await this.update(_id, proposalUpdate);
  }
}

export default new ProposalService();
