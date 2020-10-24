import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import termService from '../services/termService';
import Helper from '../utils/helper';

class TermController {
  async create(req: Request | any, res: Response) {
    const user = req.userId;
    const termRequest = req.body;

    try {
      let term = await termService.create(termRequest);
      Helper.sendResponse(res, HttpStatus.OK, { term });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async get(req: Request | any, res: Response) {
    try {
      const term = await termService.get();
      Helper.sendResponse(res, HttpStatus.OK, { term });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const term = await termService.getById(id);
      Helper.sendResponse(res, httpStatus.OK, { term });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async update(req: Request | any, res: Response) {
    const { id } = req.params;
    const termUpdate = req.body;

    try {
      const user = await termService.update(id, termUpdate);
      Helper.sendResponse(res, HttpStatus.OK, user);
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await termService.delete(id);
      Helper.sendResponse(res, httpStatus.OK, 'Termo deletado com sucesso');
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }
}

export default new TermController();
