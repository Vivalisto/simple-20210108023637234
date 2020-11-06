import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import OrganizationService from '../services/organizationService';
import userService from '../services/userService';
import Helper from '../utils/helper';

class OrganizationController {
  async create(req: Request | any, res: Response) {
    const user = req.userId;
    const organizationRequest = req.body;

    try {
      let organization = await OrganizationService.create(organizationRequest);
      Helper.sendResponse(res, HttpStatus.OK, { organization });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.BAD_REQUEST, error);
    }
  }

  async get(req: Request | any, res: Response) {
    try {
      const organization = await OrganizationService.get();
      Helper.sendResponse(res, HttpStatus.OK, { organization });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.OK, error);
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const organization = await OrganizationService.getById(id);
      Helper.sendResponse(res, httpStatus.OK, { organization });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.OK, error);
    }
  }

  async update(req: Request | any, res: Response) {
    const { id } = req.params;
    const userId = req.userId;
    const stageUpdate = req.body;

    const userDb: any = await userService.getById(userId)

    try {
      const organization = await OrganizationService.update(id || userDb.organization, stageUpdate);
      Helper.sendResponse(res, HttpStatus.OK, { organization });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.OK, error);
    }
  }
}

export default new OrganizationController();
