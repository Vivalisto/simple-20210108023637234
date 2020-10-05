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
import customerService from './customerService';
import { sendMailUtil } from '../utils/sendMail';

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
      const organization: any = userRequest?.organization;

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
        organization,
      });
    } catch (error) {
      throw new AppError(`Erro na criação da proposta`);
    }
    return;
  }

  async updateProposalParts(_id: string, proposal: any, user: string) {
    let proponentData: any = {};
    let locatorData: any = {};

    const { proponent, locator, sendMail } = proposal;

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

    let proposalUpdate: any = await this.update(_id, {
      ...proposal,
    });

    if (sendMail && proposal) {
      const userProposal = await userService.getById(user);
      this.sendMailCreateProposal(proposalUpdate, userProposal);
    }

    return proposalUpdate;
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

  sendMailCreateProposal(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;

    sendMailUtil({
      to: locator.email,
      subject: `Olá, temos uma proposta de ${
        proposal.type === ProposalType.Aluguel ? 'locação' : 'compra e venda'
      }  para o seu imóvel!`,
      message: `
      ${locator.name}, boas notícias!<br><br>


      Acabamos de conseguir uma proposta para o seu imóvel, para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.<br><br>
      Para acessar a proposta, click aqui (#link) Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp<br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep}</bold><br><br>

      Neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua segurança e comodidade.<br>
      Em caso de dúvida, é só entrar em contato.<br><br>

      Bons negócios!<br>
      Atenciosamente.<br><br>

      ${userProposal.name}<br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br>
      CRECI: ${userProposal.creci}<br><br>

      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      to: proponent.email,
      subject: 'Proposta enviada com sucesso!',
      message: `
      
      ${proponent.name}, parabéns!<br><br>


      Sua proposta foi enviada, o locador está analisando e em breve retornaremos.<br>
      Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições negociadas e poderá
      compartilhar a proposta com eventuais participantes na tomada de decisão.<br>

      Para acessar a proposta, click aqui (#link)<br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep}</bold><br><br>


      Neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação,
      serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua
      locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100%
      digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços
      relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a
      burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a
      sua segurança e comodidade.<br><br>

      Em breve retorno com uma posição sobre a sua proposta.<br>
      Em caso de dúvida, é só entrar em contato.<br><br>
      
      Sucesso em sua negociação!<br>
      Atenciosamente.<br><br>

      ${userProposal.name}<br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br>
      CRECI: ${userProposal.creci}<br><br>

      powered by Vivalisto Proptech    
      
      `,
    });

    sendMailUtil({
      to: userProposal.email,
      subject: 'Proposta enviada com sucesso!',
      message: `
      
      ${userProposal.name}, parabéns!<br><br>


      Excelente, a proposta foi gerada e encaminhada para seus clientes, inquilinos e locadores.<br>

      Você poderá a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alterá-la e, uma vez fechada a negociação, ENVIAR PARA CONTRATAÇÃO, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formalização de forma otimizada e 100% digital, permitindo que você continue focado em atender os seus clientes e em fazer mais negócios.<br><br>

      Imóvel: ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep}<br>
      Proponente: ${proponent.name}<br>
      Locador: ${locator.name}<br><br>


      Bons negócios e sucesso em sua negociação!<br>
      Atenciosamente.<br><br>
      
      Sucesso em sua negociação!<br>
      Atenciosamente.<br><br>

      Equipe de Suporte<br><br>

      powered by Vivalisto Proptech    
      
      `,
    });

    if (followers?.length) {
      followers.forEach(function (follower: any) {
        sendMailUtil({
          to: follower,
          subject: 'Acompanhamento de proposta',
          message: `Olá. Você foi vinculado para acompanhar o andamento de uma proposta`,
        });
      });
    }
  }
}

export default new ProposalService();
