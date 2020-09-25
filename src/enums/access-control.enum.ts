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

export enum ResourcesControl {
  Proposal = 'PROPOSAL', //PROPOSTAS
  Signings = 'SIGNINGS', //CONTRATACOES
  RegistrationData = 'REGISTRATION_DATA', //DADOS CADASTRAIS
  Settings = 'SETTINGS', //CONFIGURACOES
  Users = 'Users', //USUARIOS
  Customers = 'Customers', //CLIENTES
}

export enum actionControl {
  List = 'LIST', //LISTAR
  Create = 'CREATE', //CRIAR
  Edit = 'EDIT', //EDITAR
  Delete = 'DELETE', //DELETAR
}
