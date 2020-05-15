const https = require('follow-redirects').https;
const qs = require('querystring');
const parser = require('fast-xml-parser');
const express = require('express');
const router = express.Router();
const Pedido = require('../modelo/pedido');
const Produto = require('../modelo/produto');

const TOKEN = '8B2E0E69AB45454AB8D48388C8984BD5';
const EMAIL_VENDEDOR = 'brunogamacatao@gmail.com';
const HOST_PAGSEGURO = 'ws.sandbox.pagseguro.uol.com.br';
const PATH_CHECKOUT = `/v2/checkout?email=${encodeURIComponent(EMAIL_VENDEDOR)}&token=${TOKEN}`;

// retorna todos os pedidos
router.get('/', async (req, res) => {
  res.json(await Pedido.find());
})

// retorna um pedido pelo id
router.get('/:id', getPedido, async (req, res) => {
  res.json(res.pedido);
})

// cria um pedido
router.post('/', async (req, res) => {
  const produtos = await Produto.find({
    '_id': { $in: req.body}
  });

  const pedido = await new Pedido({ produtos }).save();

  const dadosPedido = {
    email: EMAIL_VENDEDOR,
    token: TOKEN,
    currency: 'BRL',
    reference: pedido._id,
    senderName: 'Jose Comprador',
    senderAreaCode: '11',
    senderPhone: '56713293',
    senderCPF: '38440987803',
    senderBornDate: '12/03/1990',
    senderEmail: 'email@sandbox.pagseguro.com.br',
    shippingType: '3',
    shippingCost: '0.00',
    shippingAddressStreet: 'Av. Brig. Faria Lima',
    shippingAddressNumber: '1384',
    shippingAddressComplement: '2o andar',
    shippingAddressDistrict: 'Jardim Paulistano',
    shippingAddressPostalCode: '01452002',
    shippingAddressCity: 'Sao Paulo',
    shippingAddressState: 'SP',
    shippingAddressCountry: 'BRA',
    redirectURL:'http://sitedocliente.com',
    notificationURL:'https://url_de_notificacao.com'    
  };

  produtos.forEach((p, i) => {
    dadosPedido['itemId' + (i + 1)] = '' + p._id;
    dadosPedido['itemDescription' + (i + 1)] = p.nome;
    dadosPedido['itemAmount' + (i + 1)] = p.valor.toFixed(2);
    dadosPedido['itemQuantity' + (i + 1)] = '1';
  });

  const options = {
    'method': 'POST',
    'hostname': HOST_PAGSEGURO,
    'path': PATH_CHECKOUT,
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    'maxRedirects': 20
  };

  const post = https.request(options, (postRest) => {
    let chunks = [];

    postRest.on("data", (chunk) => {
      chunks.push(chunk);
    });

    postRest.on("end", (chunk) => {
      let body = Buffer.concat(chunks);
      let xmlData = body.toString();
      let checkout = parser.parse(xmlData).checkout;
      res.status(200).json({
        pedido,
        checkout
      });
    });

    postRest.on("error", (error) => {
      console.error(error);
      res.status(500).json(error);
    });
  });

  post.write(qs.stringify(dadosPedido));
  post.end();
});

// remove um pedido
router.delete('/:id', getPedido, async (req, res) => {
  await res.pedido.remove();
})

// atualiza um pedido pelo id
router.put('/:id', getPedido, async (req, res) => {
  await req.pedido.set(req.body).save();
})

// função de middleware para recuperar um pedido pelo id
async function getPedido(req, res, next) {
  try {
    res.pedido = await Pedido.findById(req.params.id)
    if (res.pedido === null) {
      return res.status(404).json({ message: 'Nao foi possivel encontrar um pedido com o id informado'})
    }
  } catch(err){
    return res.status(500).json({ message: err.message })
  }

  next();
}

module.exports = router;
