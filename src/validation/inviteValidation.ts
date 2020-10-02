import * as Yup from 'yup';
import AppError from '../errors/AppError';

const inviteSchema = Yup.object().shape({
  name: Yup.string().required(),
  email: Yup.string().required().email(),
  cellphone: Yup.string().required(),
});

export const inviteValidation = async (body: object) => {
  if (!(await inviteSchema.isValid(body))) {
    throw new AppError('Preencha todos os campos obrigatórios', 400);
  }
};
