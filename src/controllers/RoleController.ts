import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import roleService from '../services/roleService';
import Helper from '../utils/helper';

class RoleController {
  async create(req: Request | any, res: Response) {
    const user = req.userId;
    const roleRequest = req.body;

    try {
      let role = await roleService.create(roleRequest);
      Helper.sendResponse(res, HttpStatus.OK, { role });
    } catch (error) {
      Helper.sendResponse(res, httpStatus.BAD_REQUEST, error);
    }
  }

  async get(req: Request | any, res: Response) {
    try {
      const role = await roleService.get();
      Helper.sendResponse(res, HttpStatus.OK, { role });
    } catch (error) {
      Helper.sendResponse(res, httpStatus.BAD_REQUEST, error);
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const role = await roleService.getById(id);
      Helper.sendResponse(res, httpStatus.OK, { role });
    } catch (error) {
      Helper.sendResponse(res, httpStatus.BAD_REQUEST, error);
    }
  }

  async update(req: Request | any, res: Response) {
    const { id } = req.params;
    const roleUpdate = req.body;

    try {
      const user = await roleService.update(id, roleUpdate);
      Helper.sendResponse(res, HttpStatus.OK, user);
    } catch (error) {
      Helper.sendResponse(res, httpStatus.BAD_REQUEST, error);
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await roleService.delete(id);
      Helper.sendResponse(res, httpStatus.OK, 'role deletado com sucesso');
    } catch (error) {
      Helper.sendResponse(res, httpStatus.BAD_REQUEST, error);
    }
  }
}

export default new RoleController();
