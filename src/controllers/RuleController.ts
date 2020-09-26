import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import ruleService from '../services/ruleService';
import Helper from '../utils/helper';

class RoleController {
  async create(req: Request | any, res: Response) {
    const user = req.userId;
    const roleRequest = req.body;

    try {
      let rule = await ruleService.create(roleRequest);
      Helper.sendResponse(res, HttpStatus.OK, { rule });
    } catch (error) {
      Helper.sendResponse(res, httpStatus.BAD_REQUEST, error);
    }
  }

  async get(req: Request | any, res: Response) {
    try {
      const rule = await ruleService.get();
      Helper.sendResponse(res, HttpStatus.OK, { rule });
    } catch (error) {
      Helper.sendResponse(res, httpStatus.BAD_REQUEST, error);
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const rule = await ruleService.getById(id);
      Helper.sendResponse(res, httpStatus.OK, { rule });
    } catch (error) {
      Helper.sendResponse(res, httpStatus.BAD_REQUEST, error);
    }
  }

  async update(req: Request | any, res: Response) {
    const { id } = req.params;
    const roleUpdate = req.body;

    try {
      const user = await ruleService.update(id, roleUpdate);
      Helper.sendResponse(res, HttpStatus.OK, user);
    } catch (error) {
      Helper.sendResponse(res, httpStatus.BAD_REQUEST, error);
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await ruleService.delete(id);
      Helper.sendResponse(res, httpStatus.OK, 'rule deletado com sucesso');
    } catch (error) {
      Helper.sendResponse(res, httpStatus.BAD_REQUEST, error);
    }
  }
}

export default new RoleController();
