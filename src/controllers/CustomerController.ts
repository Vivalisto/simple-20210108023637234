import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import customerService from '../services/customerService';
import Helper from '../utils/helper';

class CustomerController {
  async create(req: Request | any, res: Response) {
    const user = req.userId;
    const stageRequest = req.body;

    try {
      let customers = await customerService.create(stageRequest);
      Helper.sendResponse(res, HttpStatus.OK, { customers });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async get(req: Request | any, res: Response) {
    const user = req.userId;
    try {
      const customers = await customerService.get(user);
      Helper.sendResponse(res, HttpStatus.OK, { customers });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async getById(req: Request | any, res: Response) {
    const { id } = req.params;
    const user = req.userId;

    try {
      const customers = await customerService.getById(id);
      Helper.sendResponse(res, httpStatus.OK, { customers });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async update(req: Request | any, res: Response) {
    const { id } = req.params;
    const stageUpdate = req.body;

    try {
      const user = await customerService.update(id, stageUpdate);
      Helper.sendResponse(res, HttpStatus.OK, user);
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await customerService.delete(id);
      Helper.sendResponse(res, httpStatus.OK, 'customers deletado com sucesso');
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }
}

export default new CustomerController();
