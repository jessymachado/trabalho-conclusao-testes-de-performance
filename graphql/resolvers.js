const userService = require('../service/userService');
const agendamentoService = require('../service/agendamentoService');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Servico: {
    CORTE: 'CORTE',
    COLORACAO: 'COLORAÇÃO',
    ESCOVA: 'ESCOVA',
  },

  Query: {
    consultarUsuarios: () => userService.consultarUsuarios(),

    horariosDisponiveis: () => agendamentoService.listarHorariosDisponiveis(),

    horariosAgendados: (parent, { data }) => agendamentoService.listarHorariosAgendadosPorData(data),
  },

  Mutation: {
    registrarUsuario: (parent, { usuario, senha }) => {
      return userService.registrarUsuario(usuario, senha);
    },

    logarUsuario: (parent, { usuario, senha }) => {
      return userService.logarUsuario(usuario, senha);
    },

    marcarAgendamento: (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('Login obrigatório');
      }
      return agendamentoService.marcarAgendamento(args);
    },

    desmarcarAgendamento: (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('Login obrigatório');
      }
      agendamentoService.desmarcarAgendamento(args);
      return 'Horário agendado foi desmarcado.';
    },
  },
};

module.exports = resolvers;