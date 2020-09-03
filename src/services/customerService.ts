import CustomerRepository from '../repositories/customerRepository';

class CustomerService {
  async create(customer: any) {
    return await CustomerRepository.create(customer);
  }

  async get() {
    return await CustomerRepository.find();
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
}

export default new CustomerService();
