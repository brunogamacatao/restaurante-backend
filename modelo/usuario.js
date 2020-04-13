const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  login: String,
  senha: String
});

module.exports = mongoose.model('Usuario', usuarioSchema);
