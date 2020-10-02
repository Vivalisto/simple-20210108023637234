export enum GroupType {
  Vivalisto = 'VIVALISTO',
  Imobiliaria = 'IMOBILIARIA',
  Autonomo = 'AUTONOMO',
  cliente = 'CLIENTE',
}

export enum ProfileType {
  Master = 'MASTER',
  Gerente = 'GERENTE',
  Coordenador = 'COORDENADOR',
  Corretor = 'CORRETOR',
  Operacional = 'OPERACIONAL',
  AdminGerente = 'ADMIN_GERENTE',
  AdminCoordenador = 'ADMIN_COORDENADOR',
  Admin = 'ADMIN',
}

export enum ResourceControl {
  Proposal = 'PROPOSAL', //PROPOSTAS
  Signing = 'SIGNING', //CONTRATACOES
  RegistrationData = 'REGISTRATION_DATA', //DADOS CADASTRAIS
  Setting = 'SETTING', //CONFIGURACOES
  User = 'USER', //USUARIOS
  Customer = 'CUTOMER', //CLIENTES
  CPHiring = 'CP_HIRING',
  Pages = 'PAGES', //CLIENTES
}

export enum actionControl {
  Edit = 'EDIT', //EDITAR
  View = 'VIEW', //VISUALIZAR
  List = 'LIST', //LISTAR
  Create = 'CREATE', //CRIAR
  Cancel = 'CANCEL', //CANCELAR
  Delete = 'DELETE', //DELETAR
  Export = 'EXPORT', //EXPORTAR
  Approve = 'APPROVE', //APROVAR
  Invite = 'INVITE', //CONVIDAR
  Enable = 'ENABLE', //HABILITAR
  Disable = 'DISABLE', //DESABILITAR
  DashboardPage = 'DASHBOARD-PAGE', //DASHBOARD-PAGE
  RentPage = 'RENT-PAGE', //ALUGUEL-PAGE
  BuySellPage = 'BUY_SELL-PAGE', //COMPRA_VENDA-PAGE
  RegistrationDataPage = 'REGISTRATION_DATA-PAGE', //DADOS_CADASTRAIS-PAGE
  SettingPage = 'SETTING-PAGE', //CONFIGURACAO-PAGE
  UserPage = 'USER-PAGE', //USUARIO-PAGE
  CustomerPage = 'CUSTOMER-PAGE', //CLIENTES-PAGE
  CPProposalPage = 'CP_PROPOSAL-PAGE', //CONTROLE_ACESSO_PROPOSTA-PAGE
  CPHiringPage = 'CP_HIRING-PAGE', //CONTROLE_ACESSO_CONTRATACOES
}
