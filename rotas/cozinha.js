/**
 * Esse módulo simula requisições enviadas pela cozinha do restaurante.
 * Por exemplo, para notificar os usuários quando o estado de um pedido muda.
 * Para isso, esse módulo utiliza a biblioteca socket.io para enviar mensagens
 * assíncronas.
 */

const express = require('express');
const router = express.Router();

// Criando um módulo com dependência:
// Para usar esse módulo é preciso chamar uma função passando o objeto 'io'
exports = module.exports = (io) => {
  // quando o status de um alimento muda, a cozinha deve chamar esse endpoint
  router.get('/', (req, res) => {
    io.emit('cozinha', 'pedidos atualizados');
    res.send('atualização enviada para os clientes');  
  });

  return router;
};
