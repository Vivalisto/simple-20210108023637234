import OrganizationRepository from '../repositories/organizationRepository';
import AppError from '../errors/AppError';

class OrganizationService {
  async get() {
    return await OrganizationRepository.find();
  }

  async getById(_id: string) {
    return await OrganizationRepository.findById(_id);
  }

  async create(organization: any) {
    return await OrganizationRepository.create(organization).catch((error) =>
      console.log(error)
    );
  }

  async update(_id: string, organization: any) {
    return await OrganizationRepository.findByIdAndUpdate(_id, organization, {
      new: true,
    });
  }

  async exist(document: string) {
    const organization = await OrganizationRepository.findOne({ document });
    return organization;
  }
}

export default new OrganizationService();
