import * as mongoose from "mongoose";
import custumerService from "./customerService";

interface Resume {
  totalCustomer: number;
}

class StageService {
  async get(): Promise<Resume> {
    const countCustomer = await custumerService.total();

    const resumo: Resume = {
      totalCustomer: countCustomer,
    };

    return resumo;
  }
}

export default new StageService();
