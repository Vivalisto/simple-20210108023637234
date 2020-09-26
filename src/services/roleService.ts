import RoleRepository from '../repositories/roleRepository';

class RoleService {
  async create(role: any) {
    return await RoleRepository.create(role);
  }

  async get() {
    return await RoleRepository.find();
  }

  async getById(_id: string) {
    try {
      const role: any = await RoleRepository.findById(_id);

      let autorization = {
        group: role.group,
        type: role.profile.type,
        authorities: role.profile.resource.map((resource: any) => {
          let auth = resource.action.map(
            (action: any) => `${resource.name}:${action}`
          );
          return auth;
        }),
      };
      return autorization;
    } catch (error) {}

    return;
  }

  // [
  //   "posts:list",
  //   "posts:create",
  //   "users:getSelf",
  //   "home-page:visit",
  //   "dashboard-page:visit"
  // ]

  async update(_id: string, role: any) {
    return await RoleRepository.findByIdAndUpdate(_id, role, {
      new: true,
    });
  }

  async delete(_id: string) {
    return await RoleRepository.findByIdAndRemove(_id);
  }
}

export default new RoleService();
