import * as mongoose from 'mongoose';
import ProposalRepository from '../repositories/proposalRepository';
import CustomerRepository from '../repositories/customerRepository';

import CustomerService from '../services/customerService';

import { ProposalStatus } from '../enums/proposal-status.enum';
import { ProposalStage } from '../enums/proposal-stage.enum';
import { ProposalType } from '../enums/proposal-type.enum';
import { CustomerType } from '../enums/customer-type.enum';
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
    try {
      const proposalRepository = await ProposalRepository.create(proposal);

      return await proposalRepository.populate('proponent').execPopulate();
    } catch (error) {
      console.log(error);
    }
    return;
  }

  async get(userId: mongoose.Schema.Types.ObjectId, type: String) {
    let query = [];

    if (type === ProposalType.Aluguel || type === ProposalType.CompraVenda) {
      query.push(type);
    } else {
      query = [ProposalType.Aluguel, ProposalType.CompraVenda];
    }

    return await ProposalRepository.find({
      user: { _id: userId },
    })
      .where('type')
      .equals(query)
      .populate('locator')
      .populate('proponent')
      .populate('user');
  }

  async getById(_id: string) {
    return await ProposalRepository.findById(_id)
      .populate('locator')
      .populate('proponent');
  }

  async update(_id: string, proposal: any) {
    return await ProposalRepository.findByIdAndUpdate(_id, proposal, {
      new: true,
    })
      .populate('locator')
      .populate('proponent');
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

  async updateStage(proposalId: string, action: String) {
    let stageUpdate: Number;

    let proposal: any = await this.getById(proposalId);

    if (action === 'next') {
      stageUpdate = proposal.stage + 1;
    } else if (action === 'previous') {
      stageUpdate = proposal.stage - 1;
    } else {
      throw new AppError(
        `Ação não permitida. Não foi possível atualizar o passo da proposta`
      );
    }

    if (stageUpdate === ProposalStage.Criacao) {
      throw new AppError(
        'Proposta em contratação. Não é possível retornar para negociação!'
      );
    }

    if (proposal.stage === ProposalStage.Finalizada) {
      throw new AppError('Proposta já concluída. Não existe mais passos!');
    }

    return await this.update(proposalId, { stage: stageUpdate });
  }

  async getSignings(userId: mongoose.Schema.Types.ObjectId, type: String) {
    let query = [];

    if (type === ProposalType.Aluguel || type === ProposalType.CompraVenda) {
      query.push(type);
    } else {
      query = [ProposalType.Aluguel, ProposalType.CompraVenda];
    }

    return await ProposalRepository.find({
      user: { _id: userId },
      stage: { $gt: 0 },
    })
      .where('type')
      .equals(query)
      .populate('user', proposalUserFields)
      .populate('locator')
      .populate('proponent');
  }

  async createProposalParts(proposal: any) {
    try {
      let proponentData: any = {};
      let locatorData: any = {};

      const { proponent, locator, user } = proposal;

      if (proponent) {
        proponentData = await CustomerService.create({
          ...proponent,
          type: CustomerType.Proponent,
        });
      }

      if (locator) {
        locatorData = await CustomerRepository.create({
          ...locator,
          type: CustomerType.Locator,
        });
      }

      return this.create({
        ...proposal,
        proponent: proponentData._id,
        locator: locatorData._id,
      });

      // const proposalRepository = await ProposalRepository.create({
      //   ...proposal,
      //   proponent: proponentData._id,
      //   locator: locatorData._id,
      // });

      // return proposalRepository;
    } catch (error) {
      console.log(error);
    }
    return;
  }

  async updateProposalParts(_id: string, proposal: any) {
    let proponentData: any = {};
    let locatorData: any = {};

    const { proponent, locator, user } = proposal;

    if (proponent) {
      let customerFind = await CustomerRepository.find({
        email: proponent.email,
        type: CustomerType.Proponent,
      });

      if (customerFind[0]) {
        let proponentId = customerFind[0]._id;
        proponentData = await CustomerRepository.findOneAndUpdate(
          proponentId,
          proponent,
          { new: true }
        );
      } else {
        proponentData = await CustomerRepository.create({
          ...proponent,
          type: CustomerType.Proponent,
        });
      }

      return await ProposalRepository.findByIdAndUpdate(
        _id,
        {
          ...proposal,
          proponent: proponentData._id,
        },
        {
          new: true,
        }
      ).populate('proponent');
    }

    if (locator) {
      locatorData = await CustomerRepository.create({
        ...locator,
        type: CustomerType.Locator,
      });

      return await ProposalRepository.findByIdAndUpdate(
        _id,
        {
          ...proposal,
          locator: locatorData._id,
        },
        {
          new: true,
        }
      ).populate('locator');
    }

    return await ProposalRepository.findByIdAndUpdate(
      _id,
      {
        ...proposal,
      },
      {
        new: true,
      }
    ).populate('locator');
  }
}

export default new ProposalService();
