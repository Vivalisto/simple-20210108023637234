"use strict";
/**
 * **Prposta:** Utilizado para selecionar o tipo de proposta.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalStage = void 0;
var ProposalStage;
(function (ProposalStage) {
    ProposalStage[ProposalStage["Criacao"] = 0] = "Criacao";
    ProposalStage[ProposalStage["Documental"] = 1] = "Documental";
    ProposalStage[ProposalStage["Contrato"] = 2] = "Contrato";
    ProposalStage[ProposalStage["Vistoria"] = 3] = "Vistoria";
    ProposalStage[ProposalStage["EntregaChaves"] = 4] = "EntregaChaves";
    ProposalStage[ProposalStage["Conclusao"] = 5] = "Conclusao";
    ProposalStage[ProposalStage["Finalizada"] = 6] = "Finalizada";
    ProposalStage[ProposalStage["ContratacaoCancelada"] = 7] = "ContratacaoCancelada";
})(ProposalStage = exports.ProposalStage || (exports.ProposalStage = {}));
