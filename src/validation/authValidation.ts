import * as Yup from 'yup';
import AppError from '../errors/AppError';

const authSchema = Yup.object().shape({
  email: Yup.string().required().email(),
  password: Yup.string().required(),
});

const registerSchema = Yup.object().shape({
  name: Yup.string().required(),
  email: Yup.string().required().email(),
  password: Yup.string().required(),
  cpf: Yup.string().required(),
  cellphone: Yup.string().required(),
  birthDate: Yup.string().required(),
});

export const authenticateValidation = async (body: object) => {
  if (!(await authSchema.isValid(body))) {
    throw new AppError('Verifique seus dados', 400);
  }
};

export const registerValidation = async (body: object) => {
  if (!(await registerSchema.isValid(body))) {
    throw new AppError('Preencha todos os campos obrigatórios', 400);
  }
};
