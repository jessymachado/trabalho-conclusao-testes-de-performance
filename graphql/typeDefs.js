const { gql } = require('apollo-server-express');

module.exports = gql`
  type Usuario {
    usuario: String!
  }

  type UsuarioComToken {
    usuario: String!
    token: String!
  }

  enum Servico {
    CORTE
    COLORACAO
    ESCOVA
  }

  type Agendamento {
    nomeCliente: String!
    telefoneCliente: String!
    dataAgendada: String!
    horarioAgendado: String!
  servico: String!
  }

  type HorariosDisponiveis {
    datas: String!
    horarios: [String!]!
  }

  # Queries
  type Query {
    consultarUsuarios: [Usuario]
    horariosDisponiveis: [HorariosDisponiveis]
    horariosAgendados(data: String!): [Agendamento]
  }

  # Mutations
  type Mutation {
    registrarUsuario(usuario: String!, senha: String!): Usuario
    logarUsuario(usuario: String!, senha: String!): UsuarioComToken
    marcarAgendamento(nomeCliente: String!, telefoneCliente: String!, dataAgendada: String!, horarioAgendado: String!, servico: Servico!): Agendamento
    desmarcarAgendamento(nomeCliente: String!, telefoneCliente: String!, dataAgendada: String!, horarioAgendado: String!): String
  }
`;