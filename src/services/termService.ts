import TermRepository from '../repositories/termRepository';

class StageService {
  async create(term: any) {
    return await TermRepository.create(term);
  }

  async get() {
    return await TermRepository.find();
  }

  async getById(_id: string) {
    return await TermRepository.findById(_id); //.populate('user')
  }

  async update(_id: string, term: any) {
    return await TermRepository.findByIdAndUpdate(_id, term, {
      new: true,
    });
  }

  async delete(_id: string) {
    return await TermRepository.findByIdAndRemove(_id);
  }
}

export default new StageService();
