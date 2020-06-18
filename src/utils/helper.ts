import { Response } from 'express';

class Helper {
  sendResponse = function (res: Response, statusCode: any, data: any) {
    return res.status(statusCode).json({ result: data });
  };
}

export default new Helper();
