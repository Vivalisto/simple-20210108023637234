import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import httpStatus, * as HttpStatus from 'http-status';
import { promisify } from 'util';

import authConfig from '../config/keys-dev';
import Helper from '../utils/helper';

export default async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  const authHeader: any = req.headers.authorization;

  if (!authHeader) {
    Helper.sendResponse(res, httpStatus.UNAUTHORIZED, 'Token não informado');
  }

  const parts = authHeader.split(' ');
  console.log('token', authHeader);
  console.log(parts.length);
  if (!(parts.length === 2))
    Helper.sendResponse(res, httpStatus.UNAUTHORIZED, 'Token error');

  const [schema, token] = parts;
  console.log('/ˆBearer/i.test(schema)', /ˆBearer/i.test(schema));

  if (!/^Bearer$/i.test(schema))
    Helper.sendResponse(res, httpStatus.UNAUTHORIZED, 'Token mal formatado');

  jwt.verify(token, authConfig.secretOrKey, (err: any, decoded: any) => {
    if (err)
      return Helper.sendResponse(
        res,
        httpStatus.UNAUTHORIZED,
        'Token inválido'
      );

    req.userId = decoded.id;
    return next();
  });
};
