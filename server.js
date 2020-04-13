// Lê os dados do arquivo .env
require('dotenv').config()

// Importa os frameworks
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Conecta ao banco de dados
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('conectado ao banco de dados'))

// Cria o servidor web
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Configura o servidor web
app.use(cors()); // permite requisições CORS de qualquer host
app.use(cookieParser()); // processa os cookies do cabeçalho e popula req.cookies com um objeto onde os nomes dos cookies são as chaves
app.use(express.json()); // se o corpo da requisição é json, popula um objeto req.body com seu valor

// Configura os roteamentos
app.get('/', (req, res) => {
  res.send('Backend do Restaurante - Node.JS + MongoDB');
});
app.use('/produtos', require('./rotas/produtos'));
app.use('/cozinha', require('./rotas/cozinha')(io));

// Autenticação com JWT
app.post('/login', (req, res, next) => {
  if (req.body.login === 'admin' && req.body.password === 'admin'){
    const payload = { // posso passar qq informação para o cliente
      id: 1,
      username: 'admin'
    };

    var token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: 300 // expira em 5 minutos (300 segundos)
    });

    res.status(200).send({ auth: true, token: token });
  } else {
    res.status(500).send('Login inválido!');
  }
});

app.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

// Criando uma função de middleware para checar o token
const verificaTokenJWT = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (!token) {
    return res.status(401).send({ 
      auth: false, 
      message: 'Não foi encontrado o token.' 
    });
  }
  
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send({ 
        auth: false, 
        message: 'Não foi possível autenticar o token.' 
      });
    }
    
    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next(); // pode continuar processando a requisição
  });
};

// Criando algumas rotas seguras
app.get('/privado', verificaTokenJWT, (req, res, next) => {
  res.send('Deu certo !');
});

// Respondendo a eventos do Socket.IO
io.on('connection', socket => { // o socket representa o cliente
  console.log('um novo usuario está conectado 😄');

  socket.on('disconnect', () => {
    console.log('um usuário desconectou 😞');
  });
});

// Inicia o servidor web
http.listen(parseInt(process.env.SERVER_PORT), () => {
  console.log('servidor iniciado com sucesso');
  console.log('Servidor rodando em http://localhost:' + process.env.SERVER_PORT);
});
