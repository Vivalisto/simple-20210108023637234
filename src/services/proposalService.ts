import ProposalRepository from '../repositories/proposalRepository';
import * as mongoose from 'mongoose';

class ProposalService {
  async create(proposal: any) {
    return await ProposalRepository.create(proposal);
  }

  async get(userId: mongoose.Schema.Types.ObjectId) {
    return await ProposalRepository.find({ user: { _id: userId } });
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
}

export default new ProposalService();
