import { Response } from 'express';
import httpStatus, * as HttpStatus from 'http-status';

class Helper {
  sendResponse = function (res: Response, statusCode: any = 400, data: any) {
    if (
      statusCode === HttpStatus.BAD_REQUEST ||
      statusCode === HttpStatus.UNAUTHORIZED
    )
      return res.status(statusCode).json({ code: statusCode, message: data });

    if (Array.isArray(data)) {
      return res.status(statusCode).json({ hasNext: false, items: data });
    }
    return res.status(statusCode).json({ ...data });
  };
}

export default new Helper();
