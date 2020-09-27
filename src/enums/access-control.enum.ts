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
  User = 'User', //USUARIOS
  Customer = 'Customer', //CLIENTES
}

export enum actionControl {
  Edit = 'EDIT', //EDITAR
  View = 'VIEW',
  List = 'LIST', //LISTAR
  Create = 'CREATE', //CRIAR
  Cancel = 'CANCEL', //CANCELAR
  Delete = 'DELETE', //DELETAR
}
