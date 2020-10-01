import { Request, Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

import proposalService from '../services/proposalService';
import Helper from '../utils/helper';

class ProposalController {
  async create(req: Request | any, res: Response) {
    const user = req.userId;
    const proposalRequest = req.body;

    try {
      let proposal = await proposalService.createProposalParts({
        ...proposalRequest,
        user,
      });
      Helper.sendResponse(res, HttpStatus.OK, { proposal });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.BAD_REQUEST, error);
    }
  }

  async get(req: Request | any, res: Response) {
    try {
      const { type } = req.query;
      const proposals = await proposalService.get(req.userId, type);
      Helper.sendResponse(res, HttpStatus.OK, { proposals });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.BAD_REQUEST, error);
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const proposal = await proposalService.getById(id);
      Helper.sendResponse(res, httpStatus.OK, { proposal });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.BAD_REQUEST, error);
    }
  }

  async update(req: Request | any, res: Response) {
    const { id } = req.params;
    const user = req.userId;
    const ProposalUpdate = req.body;

    try {
      const proposal = await proposalService.updateProposalParts(
        id,
        ProposalUpdate
      );
      Helper.sendResponse(res, HttpStatus.OK, { proposal });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.BAD_REQUEST, error);
    }
  }

  async updateStatus(req: Request | any, res: Response) {
    const { userId } = req;
    const { id } = req.params;
    const proposalStatus = req.body;

    try {
      const proposal = await proposalService.updateStatus(id, proposalStatus);
      Helper.sendResponse(res, HttpStatus.OK, { proposal });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.BAD_REQUEST, error);
    }
  }

  async updateStage(req: Request | any, res: Response) {
    const { userId } = req;
    const { id } = req.params;
    const { action } = req.body;

    try {
      const proposal = await proposalService.updateStage(id, action);
      Helper.sendResponse(res, HttpStatus.OK, { proposal });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.BAD_REQUEST, error);
    }
  }

  async getSignings(req: Request | any, res: Response) {
    const { type } = req.query;
    try {
      const proposals = await proposalService.getSignings(req.userId, type);
      Helper.sendResponse(res, HttpStatus.OK, { proposals });
    } catch (error) {
      Helper.sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Erro ao buscar as propostas'
      );
    }
  }

  async getByCustomer(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const proposals = await proposalService.getByCustomer(id);
      Helper.sendResponse(res, httpStatus.OK, { proposals });
    } catch (error) {
      Helper.sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, error);
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
