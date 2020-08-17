import StageRepository from '../repositories/stageRepository';
import * as mongoose from 'mongoose';

class StageService {
  async create(stage: any) {
    return await StageRepository.create(stage);
  }

  async get() {
    return await StageRepository.find();
  }

  async getById(_id: string) {
    return await StageRepository.findById(_id); //.populate('user')
  }

  async update(_id: string, stage: any) {
    return await StageRepository.findByIdAndUpdate(_id, stage, {
      new: true,
    });
  }

  async delete(_id: string) {
    return await StageRepository.findByIdAndRemove(_id);
  }
}

export default new StageService();
