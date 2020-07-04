import * as Yup from 'yup';
import httpStatus, * as HttpStatus from 'http-status';
import { Response } from 'express';
import Helper from '../utils/helper';

const schema = Yup.object().shape({
  email: Yup.string().required().email(),
  password: Yup.string().required(),
});

export const authenticateValidation = async (res: Response, body: object) => {
  if (!(await schema.isValid(body))) {
    Helper.sendResponse(res, httpStatus.BAD_REQUEST, 'Verifique seus dados');
  }
};