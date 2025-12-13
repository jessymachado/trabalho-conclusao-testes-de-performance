const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secretdemo';
const { usuarios } = require('../model/userModel');
let usuarioLogado = null;

function registrarUsuario(usuario, senha) {
  if (usuarios.find(u => u.usuario === usuario)) {
    throw new Error('Usuário já existe.');
  }
  const novoUsuario = { usuario, senha };
  usuarios.push(novoUsuario);
  return { usuario: novoUsuario.usuario }; 
}

function logarUsuario(usuario, senha) {
  const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  if (!usuarioEncontrado) {
    throw new Error('Credenciais inválidas.');
  }
  const token = jwt.sign({ usuario: usuarioEncontrado.usuario }, SECRET, { expiresIn: '2h' });
  return { usuario: usuarioEncontrado.usuario, token };
}

function deslogarUsuario() {
  usuarioLogado = null;
}

function consultarUsuarios() {
  return usuarios.map(u => ({ usuario: u.usuario }));
}

module.exports = {
  registrarUsuario,
  logarUsuario,
  consultarUsuarios,
  deslogarUsuario
};