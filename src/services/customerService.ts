import CustomerRepository from '../repositories/customerRepository';

import Mail from '../services/emailService';
import { sendMail } from '../utils/sendMail';

class CustomerService {
  async create(customer: any) {
    return await CustomerRepository.create(customer);
  }

  async get(user: string) {
    return await CustomerRepository.find({ user });
  }

  async getById(_id: string) {
    return await CustomerRepository.findById(_id); //.populate('user')
  }

  async update(_id: string, customer: any) {
    return await CustomerRepository.findByIdAndUpdate(_id, customer, {
      new: true,
    });
  }

  async delete(_id: string) {
    return await CustomerRepository.findByIdAndRemove(_id);
  }

  sendMail(proposal: any) {
    Mail.to = proposal.locator.email;
    Mail.subject = 'Parabéns! Temos uma proposta de locação para o seu imóvel.';
    Mail.message = `Olá, ${proposal.locator.name}. Acabamos de conseguir uma proposta para o seu imóvel. `;
    Mail.sendMail();

    Mail.to = proposal.proponent.email;
    Mail.subject =
      'Parabéns! Sua proposta foi enviada, o locador está analisando e em breve retornaremos.';
    Mail.message = `Olá, ${proposal.proponent.name}. Sua proposta de aluguél foi gerada com sucesso.`;
    Mail.sendMail();
  }
}

export default new CustomerService();
