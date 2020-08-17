import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import stageService from '../services/stageService';
import Helper from '../utils/helper';

class StageController {
  async create(req: Request | any, res: Response) {
    const user = req.userId;
    const stageRequest = req.body;

    try {
      let stage = await stageService.create(stageRequest);
      Helper.sendResponse(res, HttpStatus.OK, { stage });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async get(req: Request | any, res: Response) {
    try {
      const stage = await stageService.get();
      Helper.sendResponse(res, HttpStatus.OK, { stage });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const stage = await stageService.getById(id);
      Helper.sendResponse(res, httpStatus.OK, { stage });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async update(req: Request | any, res: Response) {
    const { id } = req.params;
    const stageUpdate = req.body;

    try {
      const user = await stageService.update(id, stageUpdate);
      Helper.sendResponse(res, HttpStatus.OK, user);
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await stageService.delete(id);
      Helper.sendResponse(res, httpStatus.OK, 'Stage deletado com sucesso');
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }
}

export default new StageController();
