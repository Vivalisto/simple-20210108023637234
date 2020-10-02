import RuleRepository from '../repositories/ruleRepository';

import { GroupType, ProfileType } from '../enums/access-control.enum';

import AppError from '../errors/AppError';

class RoleService {
  async create(rule: any) {
    if (!Object.values(GroupType).includes(rule.group)) {
      throw new AppError(`Grupo inválido`);
    }

    if (!Object.values(ProfileType).includes(rule.profile.type)) {
      throw new AppError(`Tipo do perfil inválido`);
    }

    let roleExist = await this.getByGroupProfile(rule.group, rule.profile.type);

    if (roleExist) {
      throw new AppError(`Grupo e perfil já existe`);
    }

    return await RuleRepository.create(rule);
  }

  async get() {
    return await RuleRepository.find();
  }

  async getById(_id: string) {
    try {
      const rule: any = await RuleRepository.findById(_id);

      return this.parseRole(rule);
    } catch (error) {
      throw new AppError(`Ocorreu um problema ao carregar a regra`);
    }
  }

  async getByGroupProfile(group: string, profileType: string) {
    try {
      const rule: any = await RuleRepository.find({
        group: group,
        'profile.type': profileType,
      });

      if (rule[0]) {
        return this.parseRole(rule[0]);
      }

      return undefined;
    } catch (error) {
      throw new AppError(`Ocorreu um problema ao carregar a regra`);
    }
  }

  async update(_id: string, rule: any) {
    return await RuleRepository.findByIdAndUpdate(_id, rule, {
      new: true,
    });
  }

  async delete(_id: string) {
    return await RuleRepository.findByIdAndRemove(_id);
  }

  parseRole(rule: any) {
    let autorization = {
      group: rule.group,
      type: rule.profile.type,
      authorities: rule.profile.resource.map((resource: any) => {
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
