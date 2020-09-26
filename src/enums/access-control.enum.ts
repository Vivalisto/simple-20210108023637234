export enum GroupType {
  Vivalisto = 'VIVALISTO',
  Imobiliaria = 'IMOBILIARIA',
  Autonomo = 'AUTONOMO',
}

export enum ProfileType {
  Master = 'MASTER',
  Gerente = 'GERENTE',
  Coordenador = 'COORDENADOR',
  Corretor = 'CORRETOR',
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
  List = 'LIST', //LISTAR
  Create = 'CREATE', //CRIAR
  Edit = 'EDIT', //EDITAR
  Delete = 'DELETE', //DELETAR
}
