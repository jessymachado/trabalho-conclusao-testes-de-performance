const { agendamentos } = require('../model/agendamentoModel');
const fs = require('fs');

const HORARIOS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'
];
const SERVICOS = ['CORTE', 'COLORAÇÃO', 'ESCOVA'];

function getProximosDiasUteis(qtd = 5) {
  const dias = [];
  let data = new Date();
  while (dias.length < qtd) {
    const diaSemana = data.getDay();
    if (diaSemana >= 2 && diaSemana <= 6) { // terça (2) a sábado (6)
      dias.push(new Date(data));
    }
    data.setDate(data.getDate() + 1);
  }
  return dias.map(d => d.toLocaleDateString('pt-BR'));
}

function listarHorariosDisponiveis() {
  const dias = getProximosDiasUteis();
  return dias.map(data => {
    const horariosAgendados = agendamentos.filter(a => a.dataAgendada === data).map(a => a.horarioAgendado);
    const horariosDisponiveis = HORARIOS.filter(h => !horariosAgendados.includes(h));
    return { datas: data, horarios: horariosDisponiveis };
  });
}

function listarHorariosAgendadosPorData(data) {
  return agendamentos
    .filter(a => a.dataAgendada === data)
    .sort((a, b) => HORARIOS.indexOf(a.horarioAgendado) - HORARIOS.indexOf(b.horarioAgendado));
}

function marcarAgendamento({ nomeCliente, telefoneCliente, dataAgendada, horarioAgendado, servico }) {
  // Regras de duplicidade
  if (agendamentos.find(a => a.nomeCliente === nomeCliente && a.telefoneCliente === telefoneCliente && a.dataAgendada === dataAgendada && a.servico === servico && a.horarioAgendado === horarioAgendado)) {
    throw new Error('Cliente já possui agendamento para este serviço neste dia e horário.');
  }
  if (agendamentos.find(a => a.dataAgendada === dataAgendada && a.horarioAgendado === horarioAgendado)) {
    throw new Error('O horário desejado já está agendado por outro cliente.');
  }
  const agendamento = { nomeCliente, telefoneCliente, dataAgendada, horarioAgendado, servico };
  agendamentos.push(agendamento);
  return agendamento;
}

function desmarcarAgendamento({ nomeCliente, telefoneCliente, dataAgendada, horarioAgendado }) {
  const idx = agendamentos.findIndex(a => a.nomeCliente === nomeCliente && a.telefoneCliente === telefoneCliente && a.dataAgendada === dataAgendada && a.horarioAgendado === horarioAgendado);
  if (idx === -1) throw new Error('Agendamento não encontrado.');
  agendamentos.splice(idx, 1);  
  return true;
}

module.exports = {
  HORARIOS,
  SERVICOS,
  getProximosDiasUteis,
  listarHorariosDisponiveis,
  listarHorariosAgendadosPorData,
  marcarAgendamento,
  desmarcarAgendamento
};