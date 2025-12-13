const express = require('express');
const router = express.Router();
const agendamentoService = require('../service/agendamentoService');
const authenticateToken = require('../middleware/authenticateToken');


router.post('/agendamento/marcar', authenticateToken, (req, res) => {
  try {
    const agendamento = agendamentoService.marcarAgendamento(req.body);
    res.status(201).json({ message: 'Agendamento realizado com sucesso!', agendamento });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/agendamento/desmarcar', authenticateToken, (req, res) => {
  try {
    agendamentoService.desmarcarAgendamento(req.body);
    res.status(200).json({ message: 'Horário agendado foi desmarcado.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get('/agendamento/horariosDisponiveis', (req, res) => {
  const horarios = agendamentoService.listarHorariosDisponiveis();
  res.status(200).json({ horariosDisponiveis: horarios });
});


router.get('/agendamento/horariosAgendados/:date', (req, res) => {
  const data = req.params.date;
  const agendados = agendamentoService.listarHorariosAgendadosPorData(data);
  res.status(200).json({ horariosAgendados: agendados });
});

module.exports = router;
