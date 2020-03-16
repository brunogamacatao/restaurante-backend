// Lê os dados do arquivo .env
require('dotenv').config()

// Importa os frameworks
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

// Conecta ao banco de dados
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('conectado ao banco de dados'))

// Cria o servidor web
const app = express();

// Configura o servidor web
app.use(cors())
app.use(express.json())

// Configura os roteamentos
app.use('/produtos', require('./rotas/produtos'))

// Inicia o servidor web
app.listen(5000, () => console.log('servidor iniciado com sucesso'))