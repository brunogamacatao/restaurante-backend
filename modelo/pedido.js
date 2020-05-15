const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  estado: {type: String, default: 'aguardando_pagamento'},
  produtos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }]
},{ 
  timestamps: true 
});

module.exports = mongoose.model('Pedido', pedidoSchema);
