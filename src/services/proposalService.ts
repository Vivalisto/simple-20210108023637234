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

import { ProfileType } from '../enums/access-control.enum';
import { apiServer } from '../config/api';
import organizationService from './organizationService';

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
    } else {
      search = {
        user: { _id: userId },
      };
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

  async updateStatus(_id: string, proposalStatus: any) {
    let proposalUpdate = proposalStatus;

    if (proposalStatus.status === ProposalStatus.EmviadaContratacao) {
      proposalUpdate = { ...proposalStatus, stage: ProposalStage.Documental };
    }

    if (proposalStatus.status === ProposalStatus.EmNegociacao) {
      proposalUpdate = { ...proposalStatus, stage: ProposalStage.Criacao };
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
    } else {
      search = {
        user: { _id: userId },
        stage: { $gt: 0 },
      };
    }

    return await ProposalRepository.find(search)
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

        if (customerFind?.length && !!customerFind[0]) {
          const { name, phone, personType } = proponent;
          await customerService.update(customerFind[0]._id, {
            name,
            phone,
            personType,
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
            organization,
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

    const { proponent, locator, sendMail } = proposal;

    if (proponent) {
      let customerFind: any = await CustomerRepository.find({
        email: proponent.email,
      });

      if (customerFind?.length && !!customerFind[0]) {
        await customerService.update(customerFind._id, proponent);
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
        });

        if (!customerFind[0].type.includes(CustomerType.Locator)) {
          customerFind[0].type.push(
            proposalDb.type === ProposalType.CompraVenda
              ? CustomerType.Salesman
              : CustomerType.Locator
          );
          await customerFind[0].save();
        }

        if (proposalDb.type === ProposalType.CompraVenda) {
          if (!customerFind[0].type.includes(CustomerType.Salesman)) {
            customerFind[0].type.push(
              proposalDb.type === ProposalType.CompraVenda
                ? CustomerType.Salesman
                : CustomerType.Locator
            );
            await customerFind[0].save();
          }
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
      if (proposalUpdate.type === ProposalType.Aluguel) {
        this.sendMailCreateProposalRent(proposalUpdate, userProposal);
      } else {
        this.sendMailCreateProposalBuySell(proposalUpdate, userProposal);
      }
    } else {
      const userProposal = await userService.getById(user);
      this.sendMailUser(proposalUpdate, userProposal);
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

  async sendMailCreateProposalRent(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      to: locator.email,
      subject: `Olá, temos uma proposta de ${
        proposal.type === ProposalType.Aluguel ? 'locação' : 'compra e venda'
      }  para o seu imóvel!`,
      message: `
      ${locator.name}, boas notícias!
      <br><br>
      Acabamos de conseguir uma proposta para o seu imóvel, para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
      <br><br>
      Para acessar a proposta, <a href=${apiServer.prod}/proposal-view/${
        proposal._id
      }> click aqui, proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      }</bold>
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
      Para acessar a proposta, <a href=${apiServer.prod}/proposal-view/${
        proposal._id
      }> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      }</bold>
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
      }<br>

      powered by Vivalisto Proptech
      `,
    });

    sendMailUtil({
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
      Para acessar a proposta, <a href=${apiServer.prod}/proposal-view/${proposal._id}> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>

      Imóvel: ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep}<br>
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
          to: follower,
          subject: 'Acampanhar proposta',
          message: `
          Olá,
          <br><br>
          Você foi adicionado para acompanhar a proposta. Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
          <br><br>
          Para acessar a proposta, <a href=${apiServer.prod}/proposal-view/${
            proposal._id
          }> click aqui, proposta: ${proposal.seq} </a>
          <br>
          Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
          <br>
          Imóvel: <bold>${proposal.immobile.publicPlace}, ${
            proposal.immobile.number
          } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
            proposal.immobile.cep
          }</bold>
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
      to: locator.email,
      subject: `Proposta atualizada para a venda de seu imóvel!`,
      message: `
      ${locator.name}, temos novidades!
      <br><br>
      Estamos evoluindo na negociação para fecharmos o negócio. No link abaixo você terá acesso às últimas condições propostas.
      <br><br>
      Para acessar a proposta, <a href=${apiServer.prod}/proposal-view/${
        proposal._id
      }> click aqui, proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      }</bold>
      <br><br>
      Lembrando que, neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises, contratos e tudo o mais necessário para a segurança da sua venda. Essa etapa também é um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, cuidamos de tudo para você, até da Escritura e do Registro de Imóveis. Temos um corpo jurídico isento e especializado em direito imobiliário e processos integrados com uso da tecnologia, para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, uma vez que cuidamos de tudo para a sua segurança e comodidade.
      <br><br>
      Caso esteja de acordo, tenha alguma dúvida ou consideração a fazer, é só entrar em contato ou responder esta mensagem
      <br><br>
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
      to: proponent.email,
      subject: 'Proposta atualizada para a compra de seu imóvel!',
      message: `
      
      ${proponent.name}, temos novidades!
      <br><br>
      Estamos evoluindo na negociação para fecharmos o negócio. No link abaixo você terá acesso às últimas condições propostas.
      <br>
      <br>
      Para acessar a proposta, <a href=${apiServer.prod}/proposal-view/${
        proposal._id
      }> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      Imóvel: <bold>${proposal.immobile.publicPlace}, ${
        proposal.immobile.number
      } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
        proposal.immobile.cep
      }</bold>
      <br><br>
      Lembrando que, neste momento, trataremos das condições comerciais e posteriormente, uma vez fechada a negociação, serão realizadas todas as análises, contratos e tudo o mais necessário para a segurança da sua compra. E que, aliás, esse é um grande diferencial nosso, pois além de termos uma jornada de contratação 100% digital, cuidamos de tudo para você, até da Escritura e do Registro de Imóveis. Temos um corpo jurídico isento e especializado em direito imobiliário e processos integrados com uso da tecnologia, para que você não precise enfrentar filas em cartórios, gastar tempo e dinheiro com a burocracia, advogados e documentação externa, uma vez que cuidamos de tudo para a sua segurança e comodidade, até mesmo do crédito imobiliário, sem nenhum custo adicional.
      <br><br>
      Caso esteja de acordo, tenha alguma dúvida ou consideração a fazer, é só entrar em contato ou responder esta mensagem
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
      to: userProposal.email,
      subject: 'Proposta alterada com sucesso!',
      message: `
      
      ${userProposal.name}, muito bem!
      <br><br>
      Estamos evoluindo, a proposta foi alterada e encaminhada para seus clientes, compradores e vendedores.
      <br>
      <br>
      É importante “não deixar o negócio esfriar”, faça o acompanhamento junto aos seus clientes e esteja próximo para responder às suas dúvidas e anseios, atuando de forma consultiva para chegar à um bom termo com ambas as partes.
      <br>
      <br>
      Lembrando que você poderá a qualquer momento acessar a proposta no sistema, em MINHAS PROPOSTAS, alterá-la e, uma vez fechada a negociação, ENVIAR PARA CONTRATAÇÃO, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formalização de forma otimizada e 100% digital, permitindo que você continue focado em atender os seus clientes e em fazer mais negócios.      
      <br>
      O link abaixo direcionará você ou seus clientes para a visualização da proposta, dessa forma, poderá compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negociação.
      <br><br>
      Para acessar a proposta, <a href=${apiServer.prod}/proposal-view/${proposal._id}> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>

      Imóvel: ${proposal.immobile.publicPlace}, ${proposal.immobile.number} - ${proposal.immobile.city} - ${proposal.immobile.state}, ${proposal.immobile.cep}<br>
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
          to: follower,
          subject: 'Acampanhar proposta',
          message: `
          Olá,
          <br><br>
          Você foi adicionado para acompanhar a proposta. Para acessá-la, basta clicar no link abaixo. Nele, você terá acesso às condições ofertadas e poderá compartilhar a proposta com eventuais participantes na tomada de decisão.
          <br><br>
          Para acessar a proposta, <a href=${apiServer.prod}/proposal-view/${
            proposal._id
          }> click aqui, proposta: ${proposal.seq} </a>
          <br>
          Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
          <br>
          Imóvel: <bold>${proposal.immobile.publicPlace}, ${
            proposal.immobile.number
          } - ${proposal.immobile.city} - ${proposal.immobile.state}, ${
            proposal.immobile.cep
          }</bold>
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

  async sendMailUser(proposal: any, userProposal: any) {
    const { locator, proponent, followers } = proposal;
    const organizationDB: any = await organizationService.getById(
      proposal.organization
    );

    sendMailUtil({
      to: userProposal.email,
      subject: 'Proposta gerada com sucesso!',
      message: `
      
      ${userProposal.name}, parabéns!
      <br><br>
      Excelente, a proposta foi gerada, mas como solicitado por você, não foi encaminhada para seus clientes, inquilinos e locadores.
      <br>
      <br>
      Você poderá a qualquer momento acessar a proposta no sistema em MINHAS PROPOSTAS, alterá-la e, uma vez fechada a negociação, ENVIAR PARA CONTRATAÇÃO, para que a sua EQUIPE DE CONTRATOS VIVALISTO de andamento no processo de formalização de forma otimizada e 100% digital, permitindo que você continue focado em atender os seus clientes e em fazer mais negócios.
      <br><br>
      O link abaixo direcionará você ou seus clientes para a visualização da proposta, dessa forma, poderá compartilhar o link com quem julgar importante e a qualquer momento, demonstrando profissionalismo e trazendo agilidade para o seu processo de negociação.
      <br><br>
      Para acessar a proposta, <a href=${apiServer.prod}/proposal-view/${proposal._id}> click aqui, Número da proposta: ${proposal.seq} </a>
      <br>
      Caso deseje compartilhar a proposta, é só copiar e colar este link em seu e-mail ou WhatsApp
      <br>
      <br>

      Imóvel: ${proposal?.immobile?.publicPlace}, ${proposal?.immobile?.number} - ${proposal?.immobile?.city} - ${proposal.immobile.state}, ${proposal.immobile.cep}<br>
      Proponente: ${proponent?.name}
      <br>
      Locador: ${locator?.name}
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
  }
}

export default new ProposalService();
