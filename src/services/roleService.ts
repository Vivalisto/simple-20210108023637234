import RoleRepository from '../repositories/roleRepository';

import { GroupType, ProfileType } from '../enums/access-control.enum';

import AppError from '../errors/AppError';

class RoleService {
  async create(role: any) {
    if (!Object.values(GroupType).includes(role.group)) {
      throw new AppError(`Grupo inválido`);
    }

    if (!Object.values(ProfileType).includes(role.profile.type)) {
      throw new AppError(`Tipo do perfil inválido`);
    }

    let roleExist = await this.getByGroupProfile(role.group, role.profile.type);

    if (roleExist) {
      throw new AppError(`Grupo e perfil já existe`);
    }

    return await RoleRepository.create(role);
  }

  async get() {
    return await RoleRepository.find();
  }

  async getById(_id: string) {
    try {
      const role: any = await RoleRepository.findById(_id);

      return this.parseRole(role);
    } catch (error) {
      throw new AppError(`Ocorreu um problema ao carregar a regra`);
    }
  }

  async getByGroupProfile(group: string, profileType: string) {
    try {
      const role: any = await RoleRepository.find({
        group: group,
        'profile.type': profileType,
      });

      if (role[0]) {
        return this.parseRole(role[0]);
      }

      return undefined;
    } catch (error) {
      throw new AppError(`Ocorreu um problema ao carregar a regra`);
    }
  }

  async update(_id: string, role: any) {
    return await RoleRepository.findByIdAndUpdate(_id, role, {
      new: true,
    });
  }

  async delete(_id: string) {
    return await RoleRepository.findByIdAndRemove(_id);
  }

  parseRole(role: any) {
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
  }
}

export default new RoleService();
