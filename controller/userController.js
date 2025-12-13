const express = require('express');
const router = express.Router();
const userService = require('../service/userService');

router.post('/usuario/registrarUsuario', (req, res) => {
  try {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
      return res.status(400).json({ erro: 'Informe usuário e senha.' });
    }
    const novoUsuario = userService.registrarUsuario(usuario, senha);
    res.status(201).json({ usuario: novoUsuario });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/usuario/logarUsuario', (req, res) => {
  try {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
      return res.status(400).json({ erro: 'Informe usuário e senha.' });
    }
    const resultado = userService.logarUsuario(usuario, senha);
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/usuario/consultarUsuarios', (req, res) => {  
  const usuarios = userService.consultarUsuarios();  
  res.status(200).json({ usuarios: usuarios });  
});

module.exports = router;