import UserRepository from '../repositories/userRepository';

class UserService {
  get() {
    return UserRepository.find();
  }

  getById(_id: string) {
    return UserRepository.findById(_id);
  }

  create(user: any) {
    return UserRepository.create(user);
  }

  update(_id: string, user: any) {
    return UserRepository.findByIdAndUpdate(_id, user);
  }

  delete(_id: string) {
    return UserRepository.findByIdAndRemove(_id);
  }
}

export default new UserService();
