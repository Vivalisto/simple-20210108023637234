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

import { GroupType, ProfileType } from '../enums/access-control.enum';
import { apiServer } from '../config/api';
import organizationService from './organizationService';
import { ResponsibleHiring } from '../enums/responsible-hiring.enum';
import { filterProposal } from '../utils/filter'

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
    let search = {};
    const userProposal: any = await userService.getById(userId);

    if (type === ProposalType.Aluguel || type === ProposalType.CompraVenda) {
      query.push(type);
    } else {
      query = [ProposalType.Aluguel, ProposalType.CompraVenda];
    }

    if (
      userProposal?.rules?.profile === ProfileType.Master &&
      userProposal.isOrganization
    ) {
      search = {
        organization: { _id: userProposal?.organization },
      };
    } else if (userProposal?.rules?.profile === ProfileType.Coordenador || userProposal?.rules?.profile === ProfileType.Gerente){
      search = {
        organization: { _id: userProposal?.organization },
      }
    } else {
      search = {
        user: { _id: userId },
      };
    }

    if(userProposal?.rules?.group === GroupType.Vivalisto) {
        return await ProposalRepository.find()
        .where('type')
        .populate('locator')
        .populate('proponent')
        .populate('user')
        .populate('organization');
    }


    return await ProposalRepository.find(search)
      .where('type')
      .equals(query)
      .populate('locator')
      .populate('proponent')
      .populate('user');
  }

  async getById(_id: string) {
    return await ProposalRepository.findById(_id)
      .populate('locator')
      .populate('proponent')
      .populate('user')
      .populate('organization');
  }

  async getByIdView(_id: string) {
    return await ProposalRepository.findById(_id)
      .populate('user')
      .populate('organization');
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

  async updateStatus(_id: string, proposalStatus: any, userId: any) {
    let proposalUpdate = proposalStatus;

    const proposal: any = await this.getById(_id);
    const user = await userService.getById(userId);

    if (proposalStatus.status === ProposalStatus.EmviadaContratacao) {
      proposalUpdate = { ...proposalStatus, stage: ProposalStage.Documental };
    }

    if (proposalStatus.status === ProposalStatus.EmNegociacao) {
      proposalUpdate = { ...proposalStatus, stage: ProposalStage.Criacao };
    }

    if (proposalStatus.status === ProposalStatus.Fechada) {
      this.sendMailApproveRentBuySell(proposal, user);
    }

    // if (proposalStatus.status === ProposalStatus.EmviadaContratacao) {
    //   this.sendMailHire(proposal, user);
    // }

    return await this.update(_id, proposalUpdate);
  }

  async updateStage(proposalId: string, action: String, userId: string) {
    let stageUpdate: Number;

    let proposal: any = await this.getById(proposalId);
    let userDB: any = await userService.getById(userId);

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

    this.SendMailByStage(stageUpdate, proposal, userDB);

    return await this.update(proposalId, { stage: stageUpdate });
  }

  async sendHiring(proposalId: string, userId: string, hiringDataReq: any) {
    let userDB: any = await userService.getById(userId);

    const {
      status,
      followers,
      userResponsible,
      proponentParts,
      ownerParts,
      responsibleHiring,
      comments,
   } = hiringDataReq

   const proposalData: any = {
      status,
      stage: ProposalStage.Documental,
      followers,
      user: userResponsible,
      hiringData: {
        proponentParts,
        ownerParts,
        responsibleHiring,
        comments,
      }
    }

    await this.update(proposalId, proposalData);
    let proposal: any = await this.getById(proposalId);

    this.sendMailHire(proposal, userDB);

    return proposal
  }

  async getSignings(userId: mongoose.Schema.Types.ObjectId, type: String) {
    let query = [];
    let search = {};
    const userProposal: any = await userService.getById(userId);

    if (type === ProposalType.Aluguel || type === ProposalType.CompraVenda) {
      query.push(type);
    } else {
      query = [ProposalType.Aluguel, ProposalType.CompraVenda];
    }
    

    if (
      userProposal?.rules?.profile === ProfileType.Master &&
      userProposal.isOrganization
    ) {
      search = {
        organization: { _id: userProposal?.organization },
        stage: { $gt: 0 },
      };
    } else if (userProposal?.rules?.profile === ProfileType.Coordenador || userProposal?.rules?.profile === ProfileType.Gerente){
      search = {
        organization: { _id: userProposal?.organization },
        stage: { $gt: 0 },
      }      
    } else {
      search = {
        user: { _id: userId },
        stage: { $gt: 0 },
      };
    }

    if(userProposal?.rules?.group === GroupType.Vivalisto && (userProposal?.rules?.profile === ProfileType.Master || userProposal?.rules?.profile === ProfileType.Gerente)) {
      return await ProposalRepository.find({stage: { $gt: 0 },})
      .where('type')
      .equals(query)
      .populate('user', proposalUserFields)
      .populate('locator')
      .populate('proponent')
      .populate('organization');
    }


    return await ProposalRepository.find(search)
      .where('type')
      .equals(query)
      .populate('user', proposalUserFields)
      .populate('locator')
      .populate('proponent');
  }

  async getIntegrationHiring(userId: mongoose.Schema.Types.ObjectId, phone: string) {
    let proposalsFiltered = []
    const proposals:any = await ProposalRepository.find({stage: { $gt: 0 }})
                        .populate('user', proposalUserFields)
                        .populate('locator')
                        .populate('proponent') ?? [];
    
    proposalsFiltered = filterProposal(proposals, phone)
    return proposalsFiltered
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

        if (customerFind?.length && !!customerFind[0]) {
          const { name, phone, personType } = proponent;
          await customerService.update(customerFind[0]._id, {
            name,
            phone,
            personType,
            organization
          });
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
            organization,
          });
        }
      }

      if (locator) {
        let customerFind: any = await CustomerRepository.find({
          email: proponent.email,
        });

        if (customerFind?.length && !!customerFind[0]) {
          const { name, phone } = locator;
          await customerService.update(customerFind[0]._id, {
            name,
            phone,
            organization
          });
          if (!customerFind[0].type.includes(CustomerType.Proponent)) {
            customerFind[0].type.push(CustomerType.Locator);
            await customerFind[0].save();
          }
          locatorData = customerFind[0];
        } else {
          locatorData = await CustomerRepository.create({
            ...locator,
            type: [CustomerType.Locator],
            user,
            organization
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
    let proposalDb: any;

    const userRequest: any = await userService.getById(user);

    const { proponent, locator, sendMail } = proposal;

    if (proponent) {
      let customerFind: any = await CustomerRepository.find({
        email: proponent.email,
      });

      if (customerFind?.length && !!customerFind[0]) {
        await customerService.update(customerFind._id, {...proponent, organization: userRequest?.organization});
        if (!customerFind[0].type.includes(CustomerType.Proponent)) {
          customerFind[0].type.push(CustomerType.Proponent);
          await customerFind[0].save();
        }
        proponentData = customerFind[0];
      } else {
        proponentData = await CustomerRepository.create({
          ...proponent,
          type: [CustomerType.Proponent],
          organization: userRequest?.organization
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
      await this.update(_id, locator);
      proposalDb = await this.getById(_id);
      let customerFind: any = await CustomerRepository.find({
        email: locator.email,
      });

      if (customerFind?.length && !!customerFind[0]) {
        const { name, phone } = locator;
        await customerService.update(customerFind[0]._id, {
          name,
          phone,
          organization: userRequest?.organization
        });

        if (
          proposalDb.type === ProposalType.Aluguel &&
          !customerFind[0].type.includes(CustomerType.Locator)
        ) {
          customerFind[0].type.push(CustomerType.Locator);
          await customerFind[0].save();
        }

        if (
          proposalDb.type === ProposalType.CompraVenda &&
          !customerFind[0].type.includes(CustomerType.Salesman)
        ) {
          customerFind[0].type.push(CustomerType.Salesman);
          await customerFind[0].save();
        }

        locatorData = customerFind[0];
      } else {
        let custType =
          proposalDb.type === ProposalType.CompraVenda
            ? CustomerType.Salesman
            : CustomerType.Locator;
        locatorData = await CustomerRepository.create({
          ...locator,
          type: [custType],
          user,
          organization: userRequest?.organization
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

    if(proposal.editProposal) {
      const userProposal = await userService.getById(user);
      if(sendMail && proposal) {
        this.sendMailEditProposal(proposalUpdate, userProposal);
      } else {
        this.noSendMailEditProposal(proposalUpdate, userProposal);
      }
    } else {
      if (sendMail && proposal) {
        const userProposal = await userService.getById(user);
        if (proposalUpdate.type === ProposalType.Aluguel) {
          this.sendMailCreateProposalRent(proposalUpdate, userProposal);
        } else {
          this.sendMailCreateProposalBuySell(proposalUpdate, userProposal);
        }
      } else if (sendMail === false) {
        const userProposal = await userService.getById(user);
        this.noSendMailUser(proposalUpdate, userProposal);
      }
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
        .populate('proponent')
        .populate('user', ['name']);
    } catch (error) {
      throw new AppError(`Problema ao carregar as propostas`);
    }
  }

  SendMailByStage(stageUpdate: Number, proposal: any, userDB: any) {
    switch (stageUpdate) {
      case ProposalStage.Contrato:
        proposal.type === ProposalType.Aluguel
          ? this.sendMailDocToContract(proposal, userDB)
          : this.sendMailDocToDueDiligence(proposal, userDB);
        break;
      case ProposalStage.Vistoria:
        proposal.type === ProposalType.Aluguel
          ? this.sendMailContractToInspection(proposal, userDB)
          : this.sendMailDueDiligenceToContract(proposal, userDB);
        break;
      case ProposalStage.EntregaChaves:
        proposal.type === ProposalType.Aluguel
          ? this.sendMailInspectionToKeyDelivery(proposal, userDB)
          : this.sendMailContractToKeysProperties(proposal, userDB);
        break;
      case ProposalStage.Conclusao:
        proposal.type === ProposalType.Aluguel
          ? this.sendMailKeyDeliveryConclusion(proposal, userDB)
          : this.sendMailKeysPropertiesConclusion(proposal, userDB);
        break;

      default:
        break;
    }
  }

  async sendMailCreateProposalRent(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: userProposal.email,
      to: locator.email,
      subject: `Olá, temos uma proposta de ${
        proposal.type === ProposalType.Aluguel ? 'locação' : 'compra e venda'
      }  para o seu imóvel!`,
      message: `
      ${locator.name}, boas notícias!
      <br><br>
      Acabamos de conseguir uma proposta para o seu imóvel, para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
      <br><br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui, proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
      <br><br>
      Neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua segurança e comodidade. 
      <br><br>
      Em caso de dúvida, é só entrar em contato.
      <br><br>

      Bons negócios!
      <br>
      Atenciosamente.
      <br><br>

      ${userProposal.name}<br>
      CRECI Corretor: ${userProposal.creci}<br><br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }<br>

      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: userProposal.email,
      to: proponent.email,
      subject: 'Proposta enviada com sucesso!',
      message: `
      
      ${proponent.name}, parabéns!
      <br><br>
      Sua proposta foi enviada, o locador está analisando e em breve retornaremos.
      <br><br>
      Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições negociadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
      <br>
      <br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
      <br><br>
      Neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua segurança e comodidade.
      <br><br>

      Em breve retorno com uma posição sobre a sua proposta.
      <br>
      Em caso de dúvida, é só entrar em contato.
      <br><br>
      
      Sucesso em sua negociação!<br>
      Atenciosamente.
      <br><br>
      ${userProposal.name}<br>
      CRECI Corretor: ${userProposal.creci}<br><br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }<br><br>

      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'atendimento@vivalisto.com.br',
      to: userProposal.email,
      subject: 'Proposta enviada com sucesso!',
      message: `
      
      ${userProposal.name}, parabéns!
      <br><br>
      Excelente, a proposta foi gerada e encaminhada para seus clientes, inquilinos e locadores.
      <br>
      <br>
      Você poderá a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alterá-la e, uma vez fechada a negociação, ENVIAR PARA CONTRATAÇÃO, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formalização de forma otimizada e 100% digital, permitindo que você continue focado em atender os seus clientes e em fazer mais negócios.
      <br><br>
      O link abaixo direcionará você ou seus clientes para a visualização da proposta, dessa forma, poderá compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negociação.
      <br><br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>

      Imóvel: ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}<br>
      Proponente: ${proponent.name}
      <br>
      Locador: ${locator.name}
      <br><br>
      Bons negócios e sucesso em sua negociação!
      <br>
      Atenciosamente.
      <br>
      <br>
      Equipe de Suporte<br><br>

      powered by Vivalisto Proptech    
      
      `,
    });

    if (followers?.length) {
      followers.forEach(function (follower: any) {
        sendMailUtil({
          from: userProposal.email,
          to: follower,
          subject: 'Acompanhar proposta',
          message: `
          Olá,
          <br><br>
          Você foi adicionado para acompanhar a proposta. Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
          <br><br>
          Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
            proposal._id
          }> click aqui, proposta: ${proposal.seq} </a>
          <br>
          Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
          <br>
          Imóvel: <bold>${proposal.immobile.publicPlace}, ${
            proposal.immobile.number
          } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
            proposal.immobile.cep
          } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
          <br><br>
          Neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua segurança e comodidade. 
          <br><br>
          Em caso de dúvida, é só entrar em contato.
          <br><br>
          Atenciosamente.
          <br><br>
    
          ${userProposal.name}<br>
          CRECI Corretor: ${userProposal.creci}<br><br>
          Telefone: ${userProposal.cellphone}<br>
          E-mail: ${userProposal.email}<br><br>
          ${
            organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''
          }<br>
          ${
            organizationDB?.name
              ? `CRECI Imobiliária: ${organizationDB.creci}`
              : ''
          }<br>
    
          powered by Vivalisto Proptech
          `,
        });
      });
    }
  }

  async sendMailCreateProposalBuySell(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: userProposal.email,
      to: locator.email,
      subject: `Olá, temos uma proposta de compra para o seu imóvel!`,
      message: `
      ${locator.name}, boas notícias!
      <br><br>
      Acabamos de conseguir uma proposta para o seu imóvel, para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
      <br><br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui, proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
      <br><br>
      Neste momento, precisamos que analise as condições para darmos andamento na negociação. Não se preocupe que nesta etapa tratamos apenas das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises, contratos e tudo o mais necessário para a segurança da sua venda.
      <br><br>
      Aliás, esse é um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, cuidamos de tudo para você, até da Escritura e do Registro de Imóveis. Temos um corpo jurídico isento e especializado em direito imobiliário e processos integrados com uso da tecnologia, para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, uma vez que cuidamos de tudo para a sua segurança e comodidade.
      <br><br>
      Em caso de dúvida, é só entrar em contato.
      <br><br>
      Bons negócios!
      <br>
      Atenciosamente.
      <br><br>

      ${userProposal.name}<br>
      CRECI Corretor: ${userProposal.creci}<br><br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }<br>

      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: userProposal.email,
      to: proponent.email,
      subject: 'Proposta enviada com sucesso!',
      message: `
      
      ${proponent.name}, parabéns!
      <br><br>
      Sua proposta foi enviada, o vendedor está analisando e em breve retornaremos.
      <br>
      <br>
      Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições negociadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
      <br>
      <br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
      <br><br>
      Neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises, contratos e tudo o mais necessário para a segurança da sua compra. Aliás, esse é um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, cuidamos de tudo para você, até da Escritura e do Registro de Imóveis. Temos um corpo jurídico isento e especializado em direito imobiliário e processos integrados com uso da tecnologia, para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, uma vez que cuidamos de tudo para a sua segurança e comodidade, até mesmo do crédito imobiliário, sem nenhum custo adicional.
      <br><br>
      Em breve retorno com uma posição sobre a sua proposta.
      <br>
      Em caso de dúvida, é só entrar em contato.
      <br>
      <br>
      Sucesso em sua negociação!
      <br>
      Atenciosamente.
      <br><br>
      ${userProposal.name}<br>
      CRECI Corretor: ${userProposal.creci}<br><br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }<br>

      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'atendimento@vivalisto.com.br',
      to: userProposal.email,
      subject: 'Proposta enviada com sucesso!',
      message: `
      
      ${userProposal.name}, parabéns!
      <br><br>
      Excelente, a proposta foi gerada e encaminhada para seus clientes, compradores e vendedores.
      <br>
      <br>
      Você poderá a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alterá-la e, uma vez fechada a negociação, ENVIAR PARA CONTRATAÇÃO, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formalização de forma otimizada e 100% digital, permitindo que você continue focado em atender os seus clientes e em fazer mais negócios.
      <br>
      <br>
      O link abaixo direcionará você ou seus clientes para a visualização da proposta, dessa forma, poderá compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negociação.
      <br>
      <br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>

      Imóvel: ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}<br>
      Proponente: ${proponent.name}
      <br>
      Vendedor: ${locator.name}
      <br><br>
      Bons negócios e sucesso em sua negociação!
      <br>
      Atenciosamente.
      <br>
      <br>
      Equipe de Suporte<br><br>

      powered by Vivalisto Proptech    
      
      `,
    });

    if (followers?.length) {
      followers.forEach(function (follower: any) {
        sendMailUtil({
          from: userProposal.email,
          to: follower,
          subject: 'Acompanhar proposta',
          message: `
          Olá,
          <br><br>
          Você foi adicionado para acompanhar a proposta. Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
          <br><br>
          Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
            proposal._id
          }> click aqui, proposta: ${proposal.seq} </a>
          <br>
          Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
          <br>
          Imóvel: <bold>${proposal.immobile.publicPlace}, ${
            proposal.immobile.number
          } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
            proposal.immobile.cep
          } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
          <br><br>
          Neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua segurança e comodidade. 
          <br><br>
          Em caso de dúvida, é só entrar em contato.
          <br><br>
          Atenciosamente.
          <br><br>
    
          ${userProposal.name}<br>
          CRECI Corretor: ${userProposal.creci}<br><br>
          Telefone: ${userProposal.cellphone}<br>
          E-mail: ${userProposal.email}<br><br>
          ${
            organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''
          }<br>
          ${
            organizationDB?.name
              ? `CRECI Imobiliária: ${organizationDB.creci}`
              : ''
          }<br>
    
          powered by Vivalisto Proptech
          `,
        });
      });
    }
  }
  async sendMailEditProposal(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: userProposal.email,
      to: locator.email,
      subject: `Proposta atualizada para ${
        proposal.type === ProposalType.Aluguel
          ? 'locação'
          : 'venda'
      } de seu imóvel!`,
      message: `
      ${locator.name}, temos novidades!
      <br><br>
      Estamos evoluindo na negociação para fecharmos o negócio. No link abaixo você terá acesso às últimas condições propostas.
      <br><br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui, proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
      <br><br>
      Lembrando que neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo edinheiro com a burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua segurança e comodidade.
      <br><br>
      Caso esteja de acordo, tenha alguma dúvida ou consideração a fazer, é só entrar em contato ou responder esta mensagem.
      <br><br>
      Bons negócios!
      <br>
      Atenciosamente.
      <br><br>

      ${userProposal.name}<br>
      CRECI Corretor: ${userProposal.creci}<br><br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }<br>

      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: userProposal.email,
      to: proponent.email,
      subject: `Proposta atualizada para ${
        proposal.type === ProposalType.Aluguel
          ? 'sua locação!'
          : 'compra de seu imóvel!'
      } `,
      message: `
      
      ${proponent.name}, temos novidades!
      <br><br>
      Estamos evoluindo na negociação para fecharmos o negócio. No link abaixo você terá acesso às últimas condições propostas.
      <br>
      <br>
      Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições negociadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
      <br>
      <br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
      <br><br>
      Lembrando que neste momento trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua segurança e comodidade.
      <br><br>
      Caso esteja de acordo, tenha alguma dúvida ou consideração a fazer, é só entrar em contato ou responder esta mensagem.
      <br>
      Em caso de dúvida, é só entrar em contato.
      <br>
      <br>
      Atenciosamente.
      <br><br>
      ${userProposal.name}<br>
      CRECI Corretor: ${userProposal.creci}<br><br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }<br>

      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'atendimento@vivalisto.com.br',
      to: userProposal.email,
      subject: 'Proposta alterada com sucesso!',
      message: `
      
      ${userProposal.name}, muito bem!
      <br><br>
      Estamos evoluindo, a proposta foi alterada e encaminhada para seus clientes, ${
        proposal.type === ProposalType.Aluguel
          ? 'inquilinos e locadores.'
          : 'compradores e vendedores.'
      }
      <br>
      <br>
      É importante “não deixar o negócio esfriar”, faça o acompanhamento junto aos seus clientes e esteja próximo para responder às suas dúvidas e anseios, atuando de forma consultiva para chegar à um bom termo com ambas as partes.
      <br>
      <br>
      Você poderá a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alterá-la e, uma vez fechada a negociação, ENVIAR PARA CONTRATAÇÃO, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formalização de forma otimizada e 100% digital, permitindo que você continue focado em atender os seus clientes e em fazer mais negócios.
      <br>
      <br>
      O link abaixo direcionará você ou seus clientes para a visualização da proposta, dessa forma, poderá compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negociação.      
      <br>
      <br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>

      Imóvel: ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}<br>
      Proponente: ${proponent.name}
      <br>
      ${
        proposal.type === ProposalType.Aluguel
          ? 'Locador'
          : 'Vendedor'
      }: ${locator.name}
      <br><br>
      Bons negócios e sucesso em sua negociação!
      <br>
      Atenciosamente.
      <br>
      <br>
      Equipe de Suporte<br><br>

      powered by Vivalisto Proptech    
      
      `,
    });

    if (followers?.length) {
      followers.forEach(function (follower: any) {
        sendMailUtil({
          from: userProposal.email,
          to: follower,
          subject: 'Acompanhar proposta',
          message: `
          Olá,
          <br><br>
          Você foi adicionado para acompanhar a proposta. Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
          <br><br>
          Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
            proposal._id
          }> click aqui, proposta: ${proposal.seq} </a>
          <br>
          Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
          <br>
          Imóvel: <bold>${proposal.immobile.publicPlace}, ${
            proposal.immobile.number
          } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
            proposal.immobile.cep
          } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
          <br><br>
          Neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua segurança e comodidade. 
          <br><br>
          Em caso de dúvida, é só entrar em contato.
          <br><br>
          Atenciosamente.
          <br><br>
    
          ${userProposal.name}<br>
          CRECI Corretor: ${userProposal.creci}<br><br>
          Telefone: ${userProposal.cellphone}<br>
          E-mail: ${userProposal.email}<br><br>
          ${
            organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''
          }<br>
          ${
            organizationDB?.name
              ? `CRECI Imobiliária: ${organizationDB.creci}`
              : ''
          }<br>
    
          powered by Vivalisto Proptech
          `,
        });
      });
    }
  }

  async noSendMailEditProposal(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: 'atendimento@vivalisto.com.br',
      to: userProposal.email,
      subject: 'Proposta alterada com sucesso!',
      message: `
      
      ${userProposal.name}, muito bem!
      <br><br>
      A proposta foi alterada, mas lembre-se, como solicitado por você, não foi encaminhada para seus clientes, ${
        proposal.type === ProposalType.Aluguel
          ? ' inquilinos e locadores.'
          : 'compradores e vendedores.'
      }
      <br>
      <br>
      Você poderá a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alterá-la e, uma vez fechada a negociação, ENVIAR PARA CONTRATAÇÃO, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formalização de forma otimizada e 100% digital, permitindo que você continue focado em atender os seus clientes e em fazer mais negócios.
      <br>
      <br>
      O link abaixo direcionará você ou seus clientes para a visualização da proposta, dessa forma, poderá compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negociação.      
      <br>
      <br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>

      Imóvel: ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}<br>
      Proponente: ${proponent.name}
      <br>
      ${
        proposal.type === ProposalType.Aluguel
          ? 'Locador'
          : 'Vendedor'
      }: ${locator.name}
      <br><br>
      Bons negócios e sucesso em sua negociação!
      <br>
      Atenciosamente.
      <br>
      <br>
      Equipe de Suporte<br><br>

      powered by Vivalisto Proptech    
      
      `,
    });

    if (followers?.length) {
      followers.forEach(function (follower: any) {
        sendMailUtil({
          from: userProposal.email,
          to: follower,
          subject: 'Proposta atualizada',
          message: `
          Olá,
          <br><br>
          Você foi adicionado para acompanhar a proposta. Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
          <br><br>
          Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
            proposal._id
          }> click aqui, proposta: ${proposal.seq} </a>
          <br>
          Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
          <br>
          Imóvel: <bold>${proposal.immobile.publicPlace}, ${
            proposal.immobile.number
          } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
            proposal.immobile.cep
          } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
          <br><br>
          Neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua segurança e comodidade. 
          <br><br>
          Em caso de dúvida, é só entrar em contato.
          <br><br>
          Atenciosamente.
          <br><br>
    
          ${userProposal.name}<br>
          CRECI Corretor: ${userProposal.creci}<br><br>
          Telefone: ${userProposal.cellphone}<br>
          E-mail: ${userProposal.email}<br><br>
          ${
            organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''
          }<br>
          ${
            organizationDB?.name
              ? `CRECI Imobiliária: ${organizationDB.creci}`
              : ''
          }<br>
    
          powered by Vivalisto Proptech
          `,
        });
      });
    }
  }

  async noSendMailUser(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: 'atendimento@vivalisto.com.br',
      to: userProposal.email,
      subject: 'Proposta gerada com sucesso!',
      message: `
      
      ${userProposal.name}, parabéns!
      <br><br>
      Excelente, a proposta foi gerada, mas como solicitado por você, não foi encaminhada para seus clientes, ${
        proposal.type === ProposalType.Aluguel
          ? 'inquilinos e locadores'
          : 'compradores e vendedores.'
      }.
      <br>
      <br>
      Você poderá a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alterá-la e, uma vez fechada a negociação, ENVIAR PARA CONTRATAÇÃO, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formalização de forma otimizada e 100% digital, permitindo que você continue focado em atender os seus clientes e em fazer mais negócios.
      <br><br>
      O link abaixo direcionará você ou seus clientes para a visualização da proposta, dessa forma, poderá compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negociação.
      <br><br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>

      Imóvel: ${proposal?.immobile?.publicPlace}, ${proposal?.immobile?.number} - ${proposal?.immobile?.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}<br>
      Proponente: ${proponent?.name}
      <br>
      ${
        proposal.type === ProposalType.Aluguel
          ? 'Locador'
          : 'Comprador'
      }: ${locator?.name}
      <br><br>
      Bons negócios e sucesso em sua negociação!
      <br>
      Atenciosamente.
      <br>
      <br>
      Equipe de Suporte<br><br>

      powered by Vivalisto Proptech    
      
      `,
    });

    if (followers?.length) {
      followers.forEach(function (follower: any) {
        sendMailUtil({
          from: userProposal.email,
          to: follower,
          subject: 'Acompanhar proposta',
          message: `
          Olá,
          <br><br>
          Você foi adicionado para acompanhar a proposta. Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
          <br><br>
          Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
            proposal._id
          }> click aqui, proposta: ${proposal.seq} </a>
          <br>
          Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
          <br>
          Imóvel: <bold>${proposal.immobile.publicPlace}, ${
            proposal.immobile.number
          } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
            proposal.immobile.cep
          } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
          <br><br>
          Neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises cadastrais, contratações de garantias, enfim, tudo para a segurança da sua locação. Aliás, esse um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, um corpo jurídico isento e especializado em direito imobiliário, integramos todos os serviços relativos à locação para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, seguros ou vistorias, uma vez que cuidamos de tudo para a sua segurança e comodidade. 
          <br><br>
          Em caso de dúvida, é só entrar em contato.
          <br><br>
          Atenciosamente.
          <br><br>
    
          ${userProposal.name}<br>
          CRECI Corretor: ${userProposal.creci}<br><br>
          Telefone: ${userProposal.cellphone}<br>
          E-mail: ${userProposal.email}<br><br>
          ${
            organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''
          }<br>
          ${
            organizationDB?.name
              ? `CRECI Imobiliária: ${organizationDB.creci}`
              : ''
          }<br>
    
          powered by Vivalisto Proptech
          `,
        });
      });
    }    
  }

  async sendMailApproveRentBuySell(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: userProposal.email,
      to: locator.email,
      subject: `Parabéns pelo sucesso na negociação!`,
      message: `
      ${locator.name}, parabéns!
      <br><br>
      Estamos felizes pelo sucesso da negociação!
      <br><br>
      Daqui em diante, nossa equipe de contratos cuidará de tudo e em breve entrarão em contato para o procedimentos de contratação.
      <br><br>
      Você poderá acessar as condições negociadas sempre que preciso, para isto basta clicar no link abaixo:
      <br><br>
      Para acessar a proposta ${
        proposal.type === ProposalType.Aluguel
          ? 'de locação'
          : 'venda do imóvel'
      }, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui, proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
      <br><br>
      Agradecemos a confiança e desejamos sucesso em sua nova locação.
      <br><br>
      Em caso de dúvidas, é só entrar em contato.
      <br>
      Atenciosamente.
      <br>
      <br>
      Atenciosamente.
      <br><br>

      ${userProposal.name}<br>
      CRECI Corretor: ${userProposal.creci}<br><br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: userProposal.email,
      to: proponent.email,
      subject: 'Parabéns pelo sucesso na negociação!',
      message: `
      
      ${proponent.name}, parabéns!
      <br><br>
      Estamos felizes pelo sucesso da negociação!
      <br>
      <br>
      Daqui em diante, nossa equipe de contratos cuidará de tudo e em breve entrarão em contato para os procedimentos de contratação.      
      <br>
      Você poderá acessar as condições negociadas sempre que preciso, para isto basta clicar no link abaixo:
      <br>
      <br>
      Para acessar a ${
        proposal.type === ProposalType.Aluguel
          ? 'de locação'
          : 'venda do imóvel'
      }, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
      <br><br>
      Agradecemos a confiança e desejamos sucesso em sua nova locação.
      <br><br>
      Em caso de dúvidas, é só entrar em contato.
      <br>
      Atenciosamente.
      <br><br>
      ${userProposal.name}<br>
      CRECI Corretor: ${userProposal.creci}<br><br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }<br>

      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'atendimento@vivalisto.com.br',
      to: userProposal.email,
      subject: `Parabéns pela ${
        proposal.type === ProposalType.Aluguel ? 'locação' : 'venda'
      } do imóvel ${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      
      ${userProposal.name}, bom trabalho!
      <br><br>
      Que bom que tenha conseguido chegar em bons termos entre ${
        proposal.type === ProposalType.Aluguel
          ? 'inquilinos e locadores!'
          : 'compradores e vendedores!'
      } Agora, para concluir o processo de locação, você precisa entrar no sistema e, em MINHAS NEGOCIAÇÕES, selecionar a proposta fechada e clicar em ENVIAR PARA CONTRATAÇÃO, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formalização de forma otimizada e 100% digital, dessa forma, você ficará livre para dar sequência no atendimento de novos clientes e fazer mais negócios.
      <br>
      <br>
      Não deixe seus clientes esperando, se ainda não ENVIOU PARA CONTRATAÇÃO, acesse o sistema e a proposta fechada clicando aqui:
      <br>
      <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}> Acesso ao sistema </a>
      <br>
      O link abaixo direcionará você ou seus clientes para a visualização da proposta, dessa forma, poderá compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negociação.
      <br>
      Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      <br>
      Imóvel: ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${
        proposal.immobile.city
      } - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}<br>
      Proponente: ${proponent.name}
      <br>
      ${proposal.type === ProposalType.Aluguel ? 'Locador' : 'Vendedor'}: ${
        locator.name
      }
      <br><br>
      Bons negócios e sucesso em sua negociação!
      Atenciosamente.
      <br>
      <br>
      Equipe de Suporte<br><br>

      powered by Vivalisto Proptech    
      
      `,
    });

    if (followers?.length) {
      followers.forEach(function (follower: any) {
        sendMailUtil({
          to: follower,
          subject: 'Acompanhar proposta',
          message: `
      
          ${proponent.name}, parabéns!
          <br><br>
          Estamos felizes pelo sucesso da negociação!
          <br>
          <br>
          Daqui em diante, nossa equipe de contratos cuidará de tudo e em breve entrarão em contato para os procedimentos de contratação.      
          <br>
          Você poderá acessar as condições negociadas sempre que preciso, para isto basta clicar no link abaixo:
          <br>
          <br>
          Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
            proposal._id
          }> click aqui, Número da proposta: ${proposal.seq} </a>
          <br>
          Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
          <br>
          Imóvel: <bold>${proposal.immobile.publicPlace}, ${
            proposal.immobile.number
          } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
            proposal.immobile.cep
           } ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}</bold>
          <br><br>
          Agradecemos a confiança e desejamos sucesso em sua nova ${
            proposal.type === ProposalType.Aluguel ? 'locação' : 'venda'
          }.
          <br><br>
          Em caso de dúvidas, é só entrar em contato.
          <br>
          Atenciosamente.
          <br><br>
          ${userProposal.name}<br>
          CRECI Corretor: ${userProposal.creci}<br><br>
          Telefone: ${userProposal.cellphone}<br>
          E-mail: ${userProposal.email}<br><br>
          ${
            organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''
          }<br>
          ${
            organizationDB?.name
              ? `CRECI Imobiliária: ${organizationDB.creci}`
              : ''
          }<br>
    
          powered by Vivalisto Proptech
          `,
        });
      });
    }
  }

  async sendMailHire(proposal: any, user: any) {
    const { locator, proponent, followers } = proposal;
    const userProposal: any = await userService.getById(proposal.user.id);

    let RESPONSIBLE: any = {
      [ResponsibleHiring.Organization]: 'Imobiliária',
      [ResponsibleHiring.Others]: 'Terceiro',
      [ResponsibleHiring.Owner]: 'Locador'
    }

    const restProposal: string = proposal?.hiringData?.responsibleHiring
    
    if(!proposal?.hiringData?.proponentParts || !proposal?.hiringData?.ownerParts) {
      sendMailUtil({
        from: 'contratos@vivalisto.com.br',
        to: userProposal.email,
        cc: user.email,
        subject: `OS ${proposal.seq}, ${
          proposal.type === ProposalType.Aluguel
            ? 'Locação'
            : 'Venda'
        }, ${proposal.immobile.publicPlace}, ${ proposal.immobile.number } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
        message: `
        Olá, ${userProposal.name}!
        <br><br>
        Mais um negócio fechado!
        <br><br>
        A Equipe de Contratos Vivalisto cuidará de todo o processo de contratação e contará com o seu apoio para responder pela imobiliária quanto às questões de sua responsabilidade, como recebimentos de comissões entre outras, as quais serão solicitadas no decorrer das etapas.
        <br><br>
        Abaixo, seguem as informações consolidadas da negociação, cujo processo de contratação poderá ser acessado a qualquer momento na Plataforma Vivalisto, em MINHAS CONTRATAÇÕES.
        <br><br>
        Para acessar a proposta ${
          proposal.type === ProposalType.Aluguel
            ? 'de locação'
            : 'venda do imóvel'
        }, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
          proposal._id
        }> click aqui, proposta: ${proposal.seq} </a>
        <br>
        <br>


        <h3 style="color: #f3953d"> Resumo de contratação</h3>
        Responsável:<br>
        ${proposal?.user?.name}
        <br>
        <br>
        Responsabilidade de envio de documentos e informações complementares:
        <br>
        ${
          proposal?.hiringData?.proponentParts
            ? (
              proposal.type === ProposalType.Aluguel
              ? 'Inquilinos'
              : 'Compradores'  
            )
            : ''
        }
        ${
          proposal?.hiringData?.ownerParts
            ? (
              proposal.type === ProposalType.Aluguel
              ? 'Locadores'
              : 'Vendedores'
    
            )
            : ''
        }
        <br>
        ${
          proposal.type === ProposalType.Aluguel
            ? `Administração da contrato: <br> ${RESPONSIBLE[proposal?.hiringData?.responsibleHiring]}`
            : ''
        }
        <br>
        Comentários e observações:
        <br>
        ${proposal?.hiringData?.comments ? proposal?.hiringData?.comments : ''}
        <br>
        <br>
        E-mails de acompanhamento:<br> 
        ${proposal?.followers.map((email:string) => ` ${email}`)}
        <br>
        <br>

        Assim como você, os clientes já foram acionados para o andamento da contratação, caso sejam eles os responsáveis pelo envio das informações complementares e da documentação.
        <br>
        Enviaremos em breve os próximos passos, mas caso precise de algo é só falar com o seu Gestor de Contratos Vivalisto.
        <br>
        <br>
        Atenciosamente.
        <br><br>
        Equipe de contratos
        <br>
        powered by Vivalisto Proptech
        `,
      });
    }

    // sendMailUtil({
    //   from: 'contratos@vivalisto.com.br',
    //   to: user.email,
    //   subject: `OS ${proposal.seq}, ${
    //     proposal.type === ProposalType.Aluguel
    //       ? 'Locação'
    //       : 'Venda'
    //   }, ${proposal.immobile.publicPlace}, ${ proposal.immobile.number } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
    //   message: `
    //   Olá, ${user.name}!
    //   <br><br>
    //   Mais um negócio fechado!
    //   <br><br>
    //   A Equipe de Contratos Vivalisto cuidará de todo o processo de contratação e contará com o seu apoio para responder pela imobiliária quanto às questões de sua responsabilidade, como recebimentos de comissões entre outras, as quais serão solicitadas no decorrer das etapas.
    //   <br><br>
    //   Abaixo, seguem as informações consolidadas da negociação, cujo processo de contratação poderá ser acessado a qualquer momento na Plataforma Vivalisto, em MINHAS CONTRATAÇÕES.
    //   <br><br>
    //   Para acessar a proposta ${
    //     proposal.type === ProposalType.Aluguel
    //       ? 'de locação'
    //       : 'venda do imóvel'
    //   }, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
    //     proposal._id
    //   }> click aqui, proposta: ${proposal.seq} </a>
    //   <br>
    //   Responsabilidade de envio de documentos e informações complementares:
    //   <br>
    //   ${
    //     proposal?.hiringData?.proponentParts
    //       ? (
    //         proposal.type === ProposalType.Aluguel
    //         ? '- Inquilinos'
    //         : '- Compradores'  
    //       )
    //       : ''
    //   }
    //   <br>
    //   ${
    //     proposal?.hiringData?.ownerParts
    //       ? (
    //         proposal.type === ProposalType.Aluguel
    //         ? '- Locadores'
    //         : '- Vendedores'
  
    //       )
    //       : ''
    //   }
    //   <br>
    //   <br>
    //   ${
    //     proposal.type === ProposalType.Aluguel
    //       ? `Administração da Locação: ${RESPONSIBLE[proposal?.hiringData?.responsibleHiring]}<br>`
    //       : '<br>'
    //   }
      
    //   <br>
    //   Outras Informações Importantes para a Contratação: ${proposal?.hiringData?.comments ? proposal?.hiringData?.comments : ''}
    //   <br><br>
    //   Assim como você, os clientes já foram acionados para o andamento da contratação, caso sejam eles os responsáveis pelo envio das informações complementares e da documentação.
    //   <br>
    //   Enviaremos em breve os próximos passos, mas caso precise de algo é só falar com o seu Gestor de Contratos Vivalisto.
    //   <br>
    //   <br>
    //   Atenciosamente.
    //   <br><br>
    //   Equipe de Contratos
    //   <br>
    //   powered by Vivalisto Proptech
    //   `,
    // });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: 'contratos@vivalisto.com.br',
      subject: `OS ${proposal.seq}, ${
        proposal.type === ProposalType.Aluguel
          ? 'Locação'
          : 'Venda'
      }, ${proposal.immobile.publicPlace}, ${ proposal.immobile.number } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      
      Mais um negócio fechado!
      <br>
      <br>
      Abaixo, seguem as informações consolidadas da negociação, cujo processo de contratação poderá ser acessado a qualquer momento na Plataforma Vivalisto, em MINHAS CONTRATAÇÕES.
      <br><br>
      Para acessar a proposta ${
        proposal.type === ProposalType.Aluguel
          ? 'de locação'
          : 'venda do imóvel'
      }, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui, proposta: ${proposal.seq} </a>
      <br>
      <br>
        <h3 style="color: #f3953d"> Resumo de contratação</h3>
        Responsável:<br>
        ${proposal?.user?.name}
        <br>
        <br>
        Responsabilidade de envio de documentos e informações complementares:
        <br>
        ${
          proposal?.hiringData?.proponentParts
            ? (
              proposal.type === ProposalType.Aluguel
              ? 'Inquilinos'
              : 'Compradores'  
            )
            : ''
        }
        ${
          proposal?.hiringData?.ownerParts
            ? (
              proposal.type === ProposalType.Aluguel
              ? 'Locadores'
              : 'Vendedores'
    
            )
            : ''
        }
        <br>
        ${
          proposal.type === ProposalType.Aluguel
            ? `Administração da contrato: <br> ${RESPONSIBLE[proposal?.hiringData?.responsibleHiring]}`
            : ''
        }
        <br>
        Comentários e observações:
        <br>
        ${proposal?.hiringData?.comments ? proposal?.hiringData?.comments : ''}
        <br>
        <br>
        E-mails de acompanhamento:<br> 
        ${proposal?.followers.map((email:string) => ` ${email}`)}
        <br>
        <br>
      `,
    });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: proposal?.hiringData?.proponentParts ? proponent.email : '', 
      cc: followers?.length ? followers : [], 
      subject: `OS ${proposal.seq}, ${
        proposal.type === ProposalType.Aluguel
          ? 'Locação'
          : 'Venda'
      }, ${proposal.immobile.publicPlace}, ${ proposal.immobile.number } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      
      Olá, ${proponent?.name}
      <br><br>
      Vamos dar início ao processo de contratação do imóvel ${proposal.immobile.publicPlace}, ${ proposal.immobile.number } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}, Ordem de Serviço ${proposal.seq}.
      <br><br>
      A Vivalisto é especialista em contratos e processos. Com corpo jurídico próprio e isento em relação às partes da transação, aportamos segurança jurídica, agilidade e especialização em todas as etapas pós- negociação. Essa é uma grande preocupação de seu corretor, ${userProposal.name}, pensando      em sua experiência como cliente e em sua satisfação.
      <br>
      <br>
      Agora, precisamos de informações complementares à sua negociação para que o processo caminhe de forma leve e com a devida segurança jurídica e operacional. É bem simples e prático! Quanto mais rápido responder, mais rápido receberá o e-mail com instruções para o envio de sua documentação de forma 100% digital. Após a análise da documentação e do(s) proponente(s), seguiremos para a assinatura on- line do contrato, vistoria do imóvel e entrega das chaves.
      <br>
      <br>
      Para envio das informações, <a href=${ proposal.type === ProposalType.Aluguel ? 'https://share.hsforms.com/1Xfp-eeMASHaXdbX0PlKLLA49vzc' : 'https://share.hsforms.com/1AIvfShu0QhmegRqm1dCE2g49vzc'}> click aqui </a>
      <br>
      <br>


      <h3 style="color: #f3953d"> Resumo de contratação</h3>
      Responsável:<br>
      ${proposal?.user?.name}
      <br>
      <br>
      Responsabilidade de envio de documentos e informações complementares:
      <br>
      ${
        proposal?.hiringData?.proponentParts
          ? (
            proposal.type === ProposalType.Aluguel
            ? 'Inquilinos'
            : 'Compradores'  
          )
          : ''
      }
      ${
        proposal?.hiringData?.ownerParts
          ? (
            proposal.type === ProposalType.Aluguel
            ? 'Locadores'
            : 'Vendedores'
  
          )
          : ''
      }
      <br>
      ${
        proposal.type === ProposalType.Aluguel
          ? `Administração da contrato: <br> ${RESPONSIBLE[proposal?.hiringData?.responsibleHiring]}`
          : ''
      }
      <br>
      Comentários e observações:
      <br>
      ${proposal?.hiringData?.comments ? proposal?.hiringData?.comments : ''}
      <br>
      <br>
      E-mails de acompanhamento:<br> 
      ${proposal?.followers.map((email:string) => ` ${email}`)}
      <br>
      <br>

      Em caso de dúvida, é só entrar em contato pelo e-mail <a> contratos@vivalisto.com.br </a>
      <br>
      <br>
      Atenciosamente.
      <br>
      Equipe de Contratos
      <br><br>

      powered by Vivalisto Proptech    
      
      `,
    });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: proposal?.hiringData?.ownerParts ? locator.email : '',
      cc: followers?.length ? followers : [],
      subject: `OS ${proposal.seq}, ${
        proposal.type === ProposalType.Aluguel
          ? 'Locação'
          : 'Venda'
      }, ${proposal.immobile.publicPlace}, ${ proposal.immobile.number } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep}`,
      message: `
      
      Olá, ${locator?.name}
      <br><br>
      Vamos dar início ao processo de contratação do imóvel ${proposal.immobile.publicPlace}, ${ proposal.immobile.number } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}, Ordem de Serviço ${proposal.seq}.
      <br><br>
      A Vivalisto é especialista em contratos e processos. Com corpo jurídico próprio e isento em relação às partes da transação, aportamos segurança jurídica, agilidade e especialização em todas as etapas pós- negociação. Essa é uma grande preocupação de seu corretor, ${userProposal.name}, pensando em sua experiência como cliente e em sua satisfação.
      <br>
      <br>
      Agora, precisamos de informações complementares à sua negociação para que o processo caminhe de forma leve e com a devida segurança jurídica e operacional. É bem simples e prático! Quanto mais rápido responder, mais rápido receberá o e-mail com instruções para o envio de sua documentação de forma 100% digital. Após a análise da documentação e do(s) proponente(s), seguiremos para a assinatura on- line do contrato, vistoria do imóvel e entrega das chaves.
      <br>
      <br>
      Para envio das informações, <a href=${ proposal.type === ProposalType.Aluguel ? 'https://share.hsforms.com/1tW7eVQ-3RmKDzsLvHVXlpw49vzc' : 'https://share.hsforms.com/1lw5Uk3cvTfKgQxRQVGMrPw49vzc'}> click aqui </a>
      <br>
      <br>


      <h3 style="color: #f3953d"> Resumo de contratação</h3>
      Responsável:<br>
      ${proposal?.user?.name}
      <br>
      <br>
      Responsabilidade de envio de documentos e informações complementares:
      <br>
      ${
        proposal?.hiringData?.proponentParts
          ? (
            proposal.type === ProposalType.Aluguel
            ? 'Inquilinos'
            : 'Compradores'  
          )
          : ''
      }
      ${
        proposal?.hiringData?.ownerParts
          ? (
            proposal.type === ProposalType.Aluguel
            ? 'Locadores'
            : 'Vendedores'
  
          )
          : ''
      }
      <br>
      ${
        proposal.type === ProposalType.Aluguel
          ? `Administração da contrato: <br> ${RESPONSIBLE[proposal?.hiringData?.responsibleHiring]}`
          : ''
      }
      <br>
      Comentários e observações:
      <br>
      ${proposal?.hiringData?.comments ? proposal?.hiringData?.comments : ''}
      <br>
      <br>
      E-mails de acompanhamento:<br> 
      ${proposal?.followers.map((email:string) => ` ${email}`)}
      <br>
      <br>

      Em caso de dúvida, é só entrar em contato pelo e-mail <a> contratos@vivalisto.com.br </a>
      <br>
      <br>
      Atenciosamente.
      <br>
      Equipe de Contratos
      <br><br>

      powered by Vivalisto Proptech    
      
      `,
    });

    // if(!proposal?.hiringData?.proponentParts && !proposal?.hiringData?.ownerParts) {
    //   sendMailUtil({
    //     from: 'contratos@vivalisto.com.br',
    //     to: userProposal.email,
    //     cc: followers?.length ? followers : [], 
    //     subject: `OS ${proposal.seq}, ${
    //       proposal.type === ProposalType.Aluguel
    //         ? 'Locação'
    //         : 'Venda'
    //     }, ${proposal.immobile.publicPlace}, ${ proposal.immobile.number } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep}`,
    //     message: `
        
    //     Olá, ${userProposal?.name}
    //     <br><br>
    //     Vamos dar início ao processo. OS: ${proposal.seq}, ${
    //       proposal.type === ProposalType.Aluguel
    //         ? 'contratação da locação'
    //         : 'contratação da venda'
    //     } do imóvel, ${proposal.immobile.publicPlace}, ${ proposal.immobile.number } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}, Ordem de Serviço ${proposal.seq}.
    //     <br><br>
    //     Conforme apontado no envio para a contratação, você ficou responsável pelo fornecimento dos documentos e informações complementares do(s) cliente(s), dessa forma, solicitamos que acesse os links abaixo para a sequência do processo.
    //     <br>
    //     <br>
    //     ${
    //       proposal.type === ProposalType.Aluguel
    //         ? `
    //         Para envio das informações de LOCATÁRIOS, <a href='https://share.hsforms.com/1Xfp-eeMASHaXdbX0PlKLLA49vzc'> click aqui </a>
    //         <br>
    //         <br>
    //         Para envio das informações de LOCADORES, <a href='https://share.hsforms.com/1tW7eVQ-3RmKDzsLvHVXlpw49vzc'> click aqui </a>
    //         `
    //         :
    //         `
    //         Para envio das informações de COMPRADORES, <a href='https://share.hsforms.com/1AIvfShu0QhmegRqm1dCE2g49vzc'> click aqui </a>
    //         <br>
    //         <br>
    //         Para envio das informações de VENDEDORES, <a href='https://share.hsforms.com/1lw5Uk3cvTfKgQxRQVGMrPw49vzc'> click aqui </a>
    //         `
    //     }
    //     <br>
    //     <br>
    //     Enviaremos os próximos passos na sequência, mas caso precise de algo é só falar com o seu Gestor de Contratos Vivalisto. Lembrando que o processo de contratação poderá ser acessado a qualquer momento na Plataforma Vivalisto, em MINHAS CONTRATAÇÕES.
    //     <br>
    //     <br>
    //     Atenciosamente.
    //     <br>
    //     Equipe de Contratos
    //     <br><br>
  
    //     powered by Vivalisto Proptech    
        
    //     `,
    //   });
    // }


    // if (followers?.length) {
    //   followers.forEach(function (follower: any) {
    //     sendMailUtil({
    //       to: follower,
    //       subject: 'Acompanhar proposta',
    //       message: `
      
    //       ${proponent.name}, parabéns!
    //       <br><br>
    //       Estamos felizes pelo sucesso da negociação!
    //       <br>
    //       <br>
    //       Daqui em diante, nossa equipe de contratos cuidará de tudo e em breve entrarão em contato para os procedimentos de contratação.      
    //       <br>
    //       Você poderá acessar as condições negociadas sempre que preciso, para isto basta clicar no link abaixo:
    //       <br>
    //       <br>
    //       Para acessar a proposta, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
    //         proposal._id
    //       }> click aqui, Número da proposta: ${proposal.seq} </a>
    //       <br>
    //       Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
    //       <br>
    //       Imóvel: <bold>${proposal.immobile.publicPlace}, ${
    //         proposal.immobile.number
    //       } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
    //         proposal.immobile.cep
    //       }</bold>
    //       <br><br>
    //       Agradecemos a confiança e desejamos sucesso em sua nova ${
    //         proposal.type === ProposalType.Aluguel ? 'locação' : 'venda'
    //       }.
    //       <br><br>
    //       Em caso de dúvidas, é só entrar em contato.
    //       <br>
    //       Atenciosamente.
    //       <br><br>
    //       ${userProposal.name}<br>
    //       CRECI Corretor: ${userProposal.creci}<br><br>
    //       Telefone: ${userProposal.cellphone}<br>
    //       E-mail: ${userProposal.email}<br><br>
    //       ${
    //         organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''
    //       }<br>
    //       ${
    //         organizationDB?.name
    //           ? `CRECI Imobiliária: ${organizationDB.creci}`
    //           : ''
    //       }<br>
    
    //       powered by Vivalisto Proptech
    //       `,
    //     });
    //   });
    // }
  }
  //ALUGUEL
  async sendMailDocToContract(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    followers.push(userProposal.email);
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: locator.email,
      subject: `Nova Etapa: Contrato - ${proposal.seq}, Locação, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      cc: followers,
      message: `
      Olá, ${locator.name}!
      <br><br>
      Inquilino(s) aprovado(s), vamos em frente!
      <br>
      Em breve você receberá um e-mail para a assinatura de seu contrato de locação. Uma vez assinado, realizaremos a vistoria e na sequência a entrega das chaves. 
      <br>
      Concluímos o levantamento da documentação e realizamos as análises. Tudo correu bem, a locação foi aprovada pelo(s) locador(es) e em breve você receberá um e-mail para a assinatura de seu contrato de locação. Uma vez assinado, realizaremos a vistoria e na sequência a entrega das chaves.
      <br><br>
      Para verificar o status da contratação,
      <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui </a>
      <br>
      Caso deseje compartilhar, é só copiar e colar este link em seu e-mail ou WhatsApp.
      <br>
      <br>
      Agradecemos a confiança e em caso de dúvidas, é só entrar em contato. 
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos 
      <br>
      <br>
      E-mail: contratos@vivalisto.com.br
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: proponent.email,
      cc: followers,
      subject: `Nova Etapa: Contrato - ${proposal.seq}, Locação, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      Olá, ${proponent.name}!
      <br><br>
      Concluímos o levantamento da documentação e realizamos as análises. Tudo correu bem, a locação foi aprovada pelo(s) locador(es) e em breve você receberá um e-mail para a assinatura de seu contrato de locação. Uma vez assinado, realizaremos a vistoria e na sequência a entrega das chaves.
      <br><br>
      Para verificar o status da contratação ${
        proposal.type === ProposalType.Aluguel
          ? ''
          : 'de venda do imóvel'
      }, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui </a>
      <br>
      Caso deseje compartilhar, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>
      Agradecemos a confiança e desejamos sucesso em sua nova locação.
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      E-mail: contratos@vivalisto.com.br
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });
  }
  
  async sendMailContractToInspection(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    followers.push(userProposal.email);
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: locator.email,
      subject: `Nova Etapa: Vistoria - ${proposal.seq}, Locação, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      cc: followers,
      message: `
      Olá, ${locator.name}!
      <br><br>
      Parabéns pela contratação de sua nova locação!
      <br><br>
      Seremos ágeis agora na conclusão da vistoria, para isso, precisamos de sua ajuda. Para o agendamento da data da vistoria e instruções para acesso ao imóvel, pedimos favor acessar o link abaixo e responder as perguntas para que possamos dar andamento.
      <br><br>
      Para agendamento da vistoria, <a href='https://form.jotform.com/203228773550051'> click aqui </a>
      <br><br>
      Para verificar o status da contratação, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui </a>
      <br>
      Caso deseje compartilhar, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>
      Assim que o laudo for concluído, enviaremos em seu e-mail para a conferência. Havendo qualquer divergência, você poderá fazer o apontamento, o qual, uma vez validado, será incluído no relatório final.
      <br>
      <br>
      Agradecemos a confiança e desejamos sucesso em sua nova locação.
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      E-mail: contratos@vivalisto.com.br
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: proponent.email,
      cc: followers,
      subject: `Nova Etapa: Vistoria - ${proposal.seq}, Locação, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      Olá, ${proponent.name}!
      <br><br>
      Parabéns pela contratação de sua nova locação!
      <br><br>
      Seremos ágeis agora na conclusão da vistoria e assim que o laudo for concluído, enviaremos em seu e-mail para a conferência. Havendo qualquer divergência, você poderá fazer o apontamento, o qual, uma vez validado, será incluído no relatório final.      
      <br><br>
      Para verificar o status da contratação, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>
      Em caso de dúvidas, é só entrar em contato.
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      E-mail: contratos@vivalisto.com.br
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });
  }

  async sendMailInspectionToKeyDelivery(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    followers.push(userProposal.email);
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: locator.email,
      subject: `Nova Etapa: Entrega de Chaves - ${proposal.seq}, Locação, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      cc: followers,
      message: `
      Olá, ${locator.name}!
      <br><br>
      Vistoria realizada, estamos concluindo o seu laudo, o qual será enviado em breve em seu e-mail. 
      <br><br>
      Agora, o próximo passo é concluir a formalização da entrega das chaves e na sequência baixar os arquivos de sua pasta digital para o seu arquivo pessoal. Para ambos os casos, você receberá instruções específicas em seu e-mail.
      <br><br>
      Para verificar o status da contratação, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui </a>
      <br>
      Caso deseje compartilhar, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>
      Estamos à disposição para qualquer esclarecimento.
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: proponent.email,
      cc: followers,
      subject: `Nova Etapa: Entrega de Chaves - ${proposal.seq}, Locação, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      Olá, ${proponent.name}!
      <br><br>
      Vistoria concluída, agora é pegar as chaves!
      <br>
      Além deste e-mail, logo mais, você receberá um contato de nossa equipe ou do administrador da locação para que combinem o recebimento das chaves.
      <br><br>
      Para verificar o status da contratação, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui </a>
      <br>
      Caso deseje compartilhar, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      E-mail: contratos@vivalisto.com.br
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });
  }
  async sendMailKeyDeliveryConclusion(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    followers.push(userProposal.email);
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: locator.email,
      subject: `Nova Etapa: Conclusão - ${proposal.seq}, Locação, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      cc: followers,
      message: `
      Olá, ${locator.name}!
      <br><br>
      Chegamos ao fim de nossa jornada! Esperamos que sua experiência tenha sido realizadora e desejamos sucesso com a nova locação.
      <br><br>
      É nossa missão aportar segurança e eficiência nas transações imobiliárias, permitindo que todos os envolvidos tenham um alto nível de satisfação com essa operação tão importante para negócios, famílias e indivíduos.
      <br><br>
      Para concluir, deverá baixar a sua “PASTA JURÍDICA”, na qual constam todos os documentos de sua transação. Indicamos que salve em lugar seguro e que faça ao menos um backup.
      <br><br>
      Agradecemos a confiança e nos colocamos à disposição para auxiliar você em negócios futuros.
      <br>
      Atenciosamente.
      <br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }
      <br><br>
      Equipe de Contratos Vivalisto
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: proponent.email,
      cc: followers,
      subject: `Nova Etapa: Conclusão - ${proposal.seq}, Locação, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      Olá, ${proponent.name}!
      <br><br>
      Chegamos ao fim de nossa jornada! Esperamos que sua experiência tenha sido realizadora na locação de seu novo imóvel, que tenha muito sucesso e felicidades durante todo o período da locação.
      <br>
      É nossa missão aportar segurança e eficiência nas transações imobiliárias, permitindo que todos os envolvidos tenham um alto nível de satisfação com essa operação tão importante para negócios, famílias e indivíduos.
      <br><br>
      Para concluir, deverá baixar a sua “PASTA JURÍDICA”, na qual constam todos os documentos de sua transação. Indicamos que salve em lugar seguro e que faça ao menos um backup.      
      <br>
      <br>
      Agradecemos a confiança e nos colocamos à disposição para auxiliar você em negócios futuros.
      <br>
      Atenciosamente.
      <br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }
      <br><br>
      Equipe de Contratos Vivalisto
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });
  }

  //COMPRA E VENDA
  async sendMailDocToDueDiligence(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    followers.push(userProposal.email);
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: locator.email,
      subject: `Nova Etapa: Due Diligence - ${proposal.seq}, Compra e Venda, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      cc: followers,
      message: `
      Olá, ${locator.name}!
      <br><br>
      Concluímos o levantamento da documentação, certidões e pesquisas para aportar segurança ao processo de venda de seu imóvel. Neste momento, nosso corpo jurídico está analisando toda a documentação, fazendo a “Due Diligence”, a diligência, como gostamos de chamar.
      <br><br>
      Vencida essa etapa, em média no prazo de até 48h úteis, entraremos em contato com o resultado da Due Diligence para a sua apreciação. Na sequência, será realizado o Contrato de Compra e Venda, para então seguirmos para a Etapa de Cartórios, onde cuidaremos da Escritura e do Registro do Imóvel.      
      <br><br>
      Para sua comodidade e segurança, cuidaremos de tudo!
      <br><br>
      Somos especialistas em direito imobiliário e nas etapas que compõem toda a transação, do início ao fim de sua contratação, atuando de forma isenta entre as partes, pois essa é uma grande preocupação de seu corretor, ${userProposal?.name}, pensando em sua experiência como cliente e em sua satisfação.      
      <br><br>
      Para verificar o status, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>
      Agradecemos a confiança e desejamos sucesso em sua nova locação.
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: proponent.email,
      cc: followers,
      subject: `Nova Etapa: Due Diligence - ${proposal.seq}, Compra e Venda, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      Olá, ${proponent.name}!
      <br><br>
      Concluímos o levantamento da documentação, certidões e pesquisas para aportar segurança ao processo de compra de seu imóvel. Neste momento, nosso corpo jurídico está analisando toda a documentação, fazendo a “Due Diligence”, a diligência, como gostamos de chamar, na qual será verificada a procedência do imóvel, se ele está livre e desembaraçado para a venda, bem como, se o(s) vendedor(es) tem algum restritivo financeiro, fiscal ou judicial que possa colocar em risco a transação.
      <br><br>
      Vencida essa etapa, em média no prazo de até 48h úteis, entraremos em contato com o resultado da Due Diligence para a sua apreciação. Na sequência, será realizado o Contrato de Compra e Venda, para então seguirmos para a Etapa de Cartórios, onde cuidaremos da Escritura e do Registro do Imóvel.
      <br><br>
      Para sua comodidade e segurança, cuidaremos de tudo!      
      <br><br>
      Somos especialistas em direito imobiliário e nas etapas que compõem toda a transação, do início ao fim de sua contratação, atuando de forma isenta entre as partes, pois essa é uma grande preocupação de seu corretor, ${userProposal?.name}, pensando em sua experiência como cliente e em sua satisfação.
      <br><br>

      Para verificar o status da contratação, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui </a>
      <br>
      Caso deseje compartilhar é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>
      Agradecemos a confiança e desejamos sucesso em sua nova locação.
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });
  }

  async sendMailDueDiligenceToContract(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    followers.push(userProposal.email);
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: locator.email,
      subject: `Nova Etapa: Contrato - ${proposal.seq}, Venda, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      cc: followers,
      message: `
      Olá, ${locator.name}!
      <br><br>
      Tudo certo, vamos em frente com o Contrato de Compra e Venda! Em breve, nossa equipe enviará a minuta e coordenará todo o processo de assinatura.
      <br><br>
      Conforme explicado anteriormente, temos um corpo jurídico próprio, especialista e focado em direito imobiliário, isento entre as partes, o que aporta segurança, agilidade e economia em todo o processo, tornando-se desnecessário o envolvimento de advogados e terceiros nesta etapa, pois seu agente imobiliário confiou à VIVALISTO essa responsabilidade preocupado em aportar especialização e segurança jurídica e operacional na transação de venda de seu imóvel. Caso ainda queira e tenha contratado um advogado para representá-lo nesta etapa, sempre problemas, estamos abertos para tirar todas as dúvidas e prestar os esclarecimentos necessários para o bom andamento da fase contratual.
      <br><br>
      Para verificar o status, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui </a>
      <br>
      <br>
      Ainda para sua comodidade e segurança, prezamos pela assinatura online, eliminando a necessidade de cartórios e papel, o também que economiza tempo e dinheiro para todos os envolvidos. Fique tranquilo que você receberá todas as instruções para o procedimento, que é simples, rápido e seguro.
      <br>
      <br>
      Agradecemos a confiança e desejamos sucesso em sua nova locação.
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: proponent.email,
      cc: followers,
      subject: `Nova Etapa: Contrato - ${proposal.seq}, Compra e Venda, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      Olá, ${proponent.name}!
      <br><br>
      Concluímos o levantamento da documentação, certidões e pesquisas para aportar segurança ao processo de compra de seu imóvel. Neste momento, nosso corpo jurídico está analisando toda a documentação, fazendo a “Due Diligence”, a diligência, como gostamos de chamar, na qual será verificada a procedência do imóvel, se ele está livre e desembaraçado para a venda, bem como, se o(s) vendedor(es) tem algum restritivo financeiro, fiscal ou judicial que possa colocar em risco a transação.
      <br><br>
      Vencida essa etapa, em média no prazo de até 48h úteis, entraremos em contato com o resultado da Due Diligence para a sua apreciação. Na sequência, será realizado o Contrato de Compra e Venda, para então seguirmos para a Etapa de Cartórios, onde cuidaremos da Escritura e do Registro do Imóvel.
      <br><br>
      Para sua comodidade e segurança, cuidaremos de tudo!      
      <br><br>
      Somos especialistas em direito imobiliário e nas etapas que compõem toda a transação, do início ao fim de sua contratação, atuando de forma isenta entre as partes, pois essa é uma grande preocupação de seu corretor, ${userProposal?.name}, pensando em sua experiência como cliente e em sua satisfação.
      <br><br>

      Para verificar o status da contratação, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui </a>
      <br>
      Caso deseje compartilhar é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>
      Agradecemos a confiança e desejamos sucesso em sua nova locação.
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });
  }
  async sendMailContractToKeysProperties(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    followers.push(userProposal.email);
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: locator.email,
      subject: `Nova Etapa: Chaves e Propriedade - ${proposal.seq}, Venda, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      cc: followers,
      message: `
      Olá, ${locator.name}!
      <br><br>
      Contrato assinado, agora é hora de cuidarmos da fase de Cartórios, aqui também temos um grande diferencial para você, pois coordenaremos todo o processo, o qual tem detalhes específicos dependendo do tipo de negociação, se for com crédito imobiliário, parcelamento direto, à vista, se há crédito imobiliário a ser liquidado, enfim, não se preocupe que estaremos aqui para conduzir os trâmites e orientá-lo nessa jornada.
      <br><br>
      Somos pioneiros também em Escrituração Online, o que elimina a necessidade da sessão em cartório, bem como, cuidamos de tudo para que o processo ocorra através dos meios digitais e com toda a segurança a eles aportada.
      <br><br>
      Como citado, esta etapa possuí diferentes detalhes para cada tipo de transação, dessa forma, você receberá os direcionamentos de seu Gestor de Contratos Vivalisto em breve, para a sequência da transferência da propriedade.      
      <br><br>
      Para verificar o status, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui </a>
      <br>
      <br>
      Ainda para sua comodidade e segurança, prezamos pela assinatura online, eliminando a necessidade de cartórios e papel, o também que economiza tempo e dinheiro para todos os envolvidos. Fique tranquilo que você receberá todas as instruções para o procedimento, que é simples, rápido e seguro.
      <br>
      <br>
      Agradecemos a confiança e desejamos sucesso em sua nova locação.
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: proponent.email,
      cc: followers,
      subject: `Nova Etapa: Chaves e Propriedade - ${proposal.seq}, Compra e Venda, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      ${proponent.name}, parabéns pela compra de seu novo imóvel!
      <br><br>
      Contrato assinado, agora é hora de cuidarmos da fase de Cartórios, aqui também temos um grande diferencial para você, pois coordenaremos todo o processo, o qual tem detalhes específicos dependendo do tipo de negociação, se for com crédito imobiliário, parcelamento direto, à vista, se há crédito imobiliário a ser liquidado, enfim, não se preocupe que estaremos aqui para conduzir os trâmites e orientá-lo nessa jornada.
      <br><br>
      Somos pioneiros também em Escrituração Online, o que elimina a necessidade da sessão em cartório, bem como, cuidamos de tudo para que o processo ocorra através dos meios digitais e com toda a segurança a eles aportada.
      <br><br>
      Como citado, esta etapa possuí diferentes detalhes para cada tipo de transação, dessa forma, você receberá os direcionamentos de seu Gestor de Contratos Vivalisto em breve, para a sequência da transferência da propriedade.
      <br><br>
      Para verificar o status, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${proposal._id}> click aqui </a>
      <br>
      Caso deseje compartilhar é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>
      Estamos quase lá! Em caso de dúvidas, é só entrar em contato.
      <br>
      Atenciosamente.
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });
  }

  async sendMailKeysPropertiesConclusion(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    followers.push(userProposal.email);
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: locator.email,
      subject: `Nova Etapa: Conclusão - ${proposal.seq}, Venda, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      cc: followers,
      message: `
      Olá, ${locator.name}!
      <br><br>
      Chegamos ao fim de nossa jornada! Esperamos que sua experiência tenha sido realizadora e desejamos sucesso em seus novos negócios.
      <br><br>
      É nossa missão aportar segurança e eficiência nas transações imobiliárias, permitindo que todos os envolvidos tenham um alto nível de satisfação com essa operação tão importante para negócios, famílias e indivíduos.
      <br><br>
      Para concluir, deverá baixar a sua “PASTA JURÍDICA”, na qual constam todos os documentos de sua transação, os quais são de grande importância pois são eles que dão validade jurídica à transação, dessa forma, indicamos que salve em lugar seguro e que faça ao menos um backup.      
      <br><br>
      Para verificar o status, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui </a>
      <br>
      <br>
      Agradecemos a confiança e nos colocamos à disposição para auxiliar você em negócios futuros.
      <br>
      Atenciosamente.
      <br><br>
      ${userProposal.name}<br>
      CRECI Corretor: ${userProposal.creci}<br><br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }
      <br><br>
      Equipe de Contratos
      <br>
      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
      from: 'contratos@vivalisto.com.br',
      to: proponent.email,
      cc: followers,
      subject: `Nova Etapa: Conclusão - ${proposal.seq}, Compra e Venda, ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep} ${proposal?.immobile?.complement ? ' - ' + proposal?.immobile?.complement : ''}`,
      message: `
      Olá, ${proponent.name}.
      <br><br>
      Chegamos ao fim de nossa jornada! Esperamos que sua experiência tenha sido realizadora na compra de seu novo imóvel, que com ele venha muito sucesso e felicidades.
      <br><br>
      É nossa missão aportar segurança e eficiência nas transações imobiliárias, permitindo que todos os envolvidos tenham um alto nível de satisfação com essa operação tão importante para negócios, famílias e indivíduos.
      <br><br>
      Para concluir, deverá baixar a sua “PASTA JURÍDICA”, na qual constam todos os documentos de sua transação, os quais são de grande importância pois são eles que dão validade jurídica à transação, dessa forma, indicamos que salve em lugar seguro e que faça ao menos um backup.
      <br><br>import { boolean } from 'yup';

      Para verificar o status, <a href=${process.env.NODE_ENV === "production" ? apiServer.prod : apiServer.staging}/proposal-view/${
        proposal._id
      }> click aqui </a>
      <br>
      Caso deseje compartilhar é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>
      Agradecemos a confiança e nos colocamos à disposição para auxiliar você em negócios futuros.
      <br>
      Atenciosamente.
      <br><br>
      ${userProposal.name}<br>
      CRECI Corretor: ${userProposal.creci}<br><br>
      Telefone: ${userProposal.cellphone}<br>
      E-mail: ${userProposal.email}<br><br>
      ${organizationDB?.name ? `Imobiliária: ${organizationDB.name}` : ''}<br>
      ${
        organizationDB?.name ? `CRECI Imobiliária: ${organizationDB.creci}` : ''
      }
      <br><br>
      Equipe de Contratos
      <br>
      <br>
      powered by Vivalisto Proptech
      `,
    });
  }
}

export default new ProposalService();
