/**
 * **Prposta:** Utilizado para selecionar o tipo de proposta.
 */

export enum ProposalStatus {
  Pendente = 'PENDENTE',
  EmNegociacao = 'EM_NEGOCIACAO',
  Fechada = 'FECHADA',
  Cancelada = 'CANCELADA',
  EmviadaContratacao = 'ENVIADA_PARA_CONTRATACAO',
  ContratacaoCancelada = 'CONTRATACAO_CANCELADA',
  ContratacaoConcluida = 'CONTRATACAO_CONCLUIDA',
}
