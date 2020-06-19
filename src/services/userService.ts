import UserRepository from '../repositories/userRepository';

class UserService {
  async get() {
    return await UserRepository.find();
  }

  async getById(_id: string) {
    return await UserRepository.findById(_id);
  }

  async create(user: any) {
    return await UserRepository.create(user);
  }

  async update(_id: string, user: any) {
    return await UserRepository.findByIdAndUpdate(_id, user);
  }

  async delete(_id: string) {
    return await UserRepository.findByIdAndRemove(_id);
  }
}

export default new UserService();
