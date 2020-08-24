import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import proposalService from '../services/proposalService';
import Helper from '../utils/helper';

class ProposalController {
  async create(req: Request | any, res: Response) {
    const user = req.userId;
    const proposalRequest = req.body;

    try {
      let proposal = await proposalService.create({ ...proposalRequest, user });
      Helper.sendResponse(res, HttpStatus.OK, { proposal });
    } catch (error) {
      console.log('error', error);
      // console.error.bind(console, `Error ${error}`);
    }
  }

  async get(req: Request | any, res: Response) {
    try {
      const proposals = await proposalService.get(req.userId);
      Helper.sendResponse(res, HttpStatus.OK, { proposals });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const proposal = await proposalService.getById(id);
      Helper.sendResponse(res, httpStatus.OK, { proposal });
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  async update(req: Request | any, res: Response) {
    const id = req.userId;
    const ProposalUpdate = req.body;

    try {
      const user = await proposalService.update(id, ProposalUpdate);
      Helper.sendResponse(res, HttpStatus.OK, user);
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }

  // async delete(req: Request, res: Response) {
  //   const { id } = req.params;

  //   try {
  //     await proposalService.delete(id);
  //     Helper.sendResponse(res, httpStatus.OK, 'Usuário deletado com sucesso');
  //   } catch (error) {
  //     console.error.bind(console, `Error ${error}`);
  //   }
  // }
}

export default new ProposalController();