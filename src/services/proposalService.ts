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
import userService from './userService';

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

      const userRequest: any = await userService.getById(user);
      const organization:any =  userRequest?.organization

      if (proponent) {
        let customerFind: any = await CustomerRepository.find({
          email: proponent.email,
        });

        if (customerFind?.length && customerFind[0]) {
          if (!customerFind[0].type.includes(CustomerType.Proponent)) {
            customerFind[0].type.push(CustomerType.Proponent);
            await customerFind[0].save();
          }
          proponentData = customerFind[0];
        } else {
          proponentData = await CustomerService.create({
            ...proponent,
            type: [CustomerType.Proponent],
            user,
          });
        }
      }

      if (locator) {
        let customerFind: any = await CustomerRepository.find({
          email: proponent.email,
        });

        if (customerFind?.length && customerFind[0]) {
          if (!customerFind[0].type.includes(CustomerType.Proponent)) {
            customerFind[0].type.push(CustomerType.Locator);
            await customerFind[0].save();
          }
          locatorData = customerFind[0];
        } else {
          locatorData = await CustomerRepository.create({
            ...locator,
            type: [CustomerType.Locator],
          });
        }
      }

      return this.create({
        ...proposal,
        proponent: proponentData._id,
        locator: locatorData._id,
        organization
      });
    } catch (error) {
      throw new AppError(`Erro na criação da proposta`);
    }
    return;
  }

  async updateProposalParts(_id: string, proposal: any, user: string) {
    let proponentData: any = {};
    let locatorData: any = {};

    const { proponent, locator } = proposal;

    if (proponent) {
      let customerFind: any = await CustomerRepository.find({
        email: proponent.email,
      });

      if (customerFind?.length && customerFind[0]) {
        if (!customerFind[0].type.includes(CustomerType.Proponent)) {
          customerFind[0].type.push(CustomerType.Proponent);
          await customerFind[0].save();
        }
        proponentData = customerFind[0];
      } else {
        proponentData = await CustomerRepository.create({
          ...proponent,
          type: [CustomerType.Proponent],
        }).catch(() => {
          throw new AppError('Erro ao atualizar a proposta');
        });
      }

      return await this.update(_id, {
        ...proposal,
        proponent: proponentData._id,
      });
    }

    if (locator) {
      let customerFind: any = await CustomerRepository.find({
        email: locator.email,
      });

      if (customerFind?.length && customerFind[0]) {
        if (!customerFind[0].type.includes(CustomerType.Locator)) {
          customerFind[0].type.push(CustomerType.Locator);
          await customerFind[0].save();
        }
        locatorData = customerFind[0];
      } else {
        locatorData = await CustomerRepository.create({
          ...locator,
          type: [CustomerType.Locator],
          user,
        });
      }

      return await this.update(_id, {
        ...proposal,
        locator: locatorData._id,
      });
    }

    return await this.update(_id, {
      ...proposal,
    });
  }

  async getByCustomer(customerId: string) {
    try {
      let Customer = await CustomerService.getById(customerId);

      if (!Customer) {
        throw new AppError(`Cliente não encontrado`);
      }

      return await ProposalRepository.find()
        .or([{ locator: customerId }, { proponent: customerId }])
        .populate('locator')
        .populate('proponent');
    } catch (error) {
      throw new AppError(`Problema ao carregar as propostas`);
    }
  }
}

export default new ProposalService();
