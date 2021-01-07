import { Request, Response } from "express";
import httpStatus, * as HttpStatus from "http-status";

import resumeService from "../services/resumeService";
import Helper from "../utils/helper";

class ResumeController {
  async get(req: Request | any, res: Response) {
    try {
      const resume = await resumeService.get();
      Helper.sendResponse(res, HttpStatus.OK, resume);
    } catch (error) {
      console.error.bind(console, `Error ${error}`);
    }
  }
}

export default new ResumeController();
