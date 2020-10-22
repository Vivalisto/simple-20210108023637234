"use strict";
/**
 * **Prposta:** Utilizado para selecionar o tipo de proposta.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalStatus = void 0;
var ProposalStatus;
(function (ProposalStatus) {
    ProposalStatus["Pendente"] = "PENDENTE";
    ProposalStatus["EmNegociacao"] = "EM_NEGOCIACAO";
    ProposalStatus["Fechada"] = "FECHADA";
    ProposalStatus["Cancelada"] = "CANCELADA";
    ProposalStatus["EmviadaContratacao"] = "ENVIADA_PARA_CONTRATACAO";
    ProposalStatus["ContratacaoCancelada"] = "CONTRATACAO_CANCELADA";
    ProposalStatus["Conclusao"] = "CONTRATACAO_CONCLUIDA";
})(ProposalStatus = exports.ProposalStatus || (exports.ProposalStatus = {}));
