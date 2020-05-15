const mongoose = require('mongoose');
const constantes = require('../util/constantes');

const pedidoSchema = new mongoose.Schema({
  estado: {type: String, default: constantes.AGUARDANDO_PAGAMENTO},
  transaction_id: String,
  produtos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }]
},{ 
  timestamps: true 
});

module.exports = mongoose.model('Pedido', pedidoSchema);
