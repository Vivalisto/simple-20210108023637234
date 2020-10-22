"use strict";
/**
 * **Garantia:** Utilizado garantia.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowType = exports.Escrow = void 0;
var Escrow;
(function (Escrow) {
    Escrow["SeguroFianca"] = "SEGURO_FIANCA";
    Escrow["DepositoCaucao"] = "DEPOSITO_CAUCAO";
    Escrow["TituloCapacitacao"] = "TITULO_CAPACITACAO";
    Escrow["Fiador"] = "FIADOR";
    Escrow["CaucaoImobiliario"] = "CAUCAO_IMOBILIARIO";
})(Escrow = exports.Escrow || (exports.Escrow = {}));
/**
 * **Garantia:** Utilizado o tipo de garantia.
 */
var EscrowType;
(function (EscrowType) {
    EscrowType["Aluguel"] = "ALUGUEL";
    EscrowType["Pacote"] = "PACOTE";
})(EscrowType = exports.EscrowType || (exports.EscrowType = {}));
