import { GroupType, ProfileType } from "../enums/access-control.enum";
import CustomerRepository from "../repositories/customerRepository";

import Mail from "../services/emailService";
import { sendMailUtil } from "../utils/sendMail";
import userService from "./userService";

class CustomerService {
  async create(customer: any) {
    return await CustomerRepository.create(customer);
  }

  async get(userId: string) {
    let query: any;
    const userData: any = await userService.getById(userId);

    if (userData?.rules?.group === GroupType.Vivalisto) {
      query = {};
    } else if (
      userData?.rules.group === GroupType.Imobiliaria &&
      userData?.rules?.profile === ProfileType.Master
    ) {
      query = { organization: userData.organization };
    } else if (
      userData?.rules.group === GroupType.Imobiliaria &&
      userData?.rules?.profile === ProfileType.Gerente
    ) {
      query = { organization: userData.organization };
    } else {
      query = { user: userId };
    }

    return await CustomerRepository.find(query).populate("organization", [
      "name",
    ]);
  }

  async getById(_id: string) {
    return await CustomerRepository.findById(_id); //.populate('user')
  }

  async update(_id: string, customer: any) {
    return await CustomerRepository.findByIdAndUpdate(_id, customer, {
      new: true,
    });
  }

  async total() {
    return CustomerRepository.count({}, (err, count) => {
      console.log(err);
    });
  }

  async delete(_id: string) {
    return await CustomerRepository.findByIdAndRemove(_id);
  }

  sendMailUtil(proposal: any) {
    Mail.to = proposal.locator.email;
    Mail.subject = "Parabéns! Temos uma proposta de locação para o seu imóvel.";
    Mail.message = `Olá, ${proposal.locator.name}. Acabamos de conseguir uma proposta para o seu imóvel. `;
    Mail.sendMail();

    Mail.to = proposal.proponent.email;
    Mail.subject =
      "Parabéns! Sua proposta foi enviada, o locador está analisando e em breve retornaremos.";
    Mail.message = `Olá, ${proposal.proponent.name}. Sua proposta de aluguél foi gerada com sucesso.`;
    Mail.sendMail();
  }
}

export default new CustomerService();
