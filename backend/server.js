const express = require('express');
const app = express();
const path = require('path');

const cookieParser = require('cookie-parser');

// Importar a configuraÃ§Ã£o do banco PostgreSQL
const db = require('./database'); // Ajuste o caminho conforme necessÃ¡rio

// ConfiguraÃ§Ãµes do servidor - quando em produÃ§Ã£o, vocÃª deve substituir o IP e a porta pelo do seu servidor remoto
//const HOST = '192.168.1.100'; // Substitua pelo IP do seu servidor remoto
const HOST = 'localhost'; // Para desenvolvimento local
const PORT_FIXA = 3001; // Porta fixa

// ========== CONFIGURAÃ‡ÃƒO DE ARQUIVOS ESTÃTICOS ==========

// Serve a pasta frontend como arquivos estÃ¡ticos
const caminhoFrontend = path.join(__dirname, '../frontend');
console.log('Caminho frontend:', caminhoFrontend);
app.use(express.static(caminhoFrontend));

// âœ… ADICIONADO: Serve a pasta uploads como arquivos estÃ¡ticos
const caminhoUploads = path.join(__dirname, 'uploads');
console.log('Caminho uploads:', caminhoUploads);
app.use('/uploads', express.static(caminhoUploads));

// ========== MIDDLEWARES ==========

app.use(cookieParser());

// Middleware para permitir CORS (Cross-Origin Resource Sharing)
// Isso Ã© Ãºtil se vocÃª estiver fazendo requisiÃ§Ãµes de um frontend que estÃ¡ rodando em um domÃ­nio diferente
// ou porta do backend.
// Em produÃ§Ã£o, vocÃª deve restringir isso para domÃ­nios especÃ­ficos por seguranÃ§a.
// Aqui, estamos permitindo qualquer origem, o que Ã© Ãºtil para desenvolvimento, mas deve ser ajustado em produÃ§Ã£o.
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500', 
    'http://127.0.0.1:5501', 
    'http://localhost:3000', 
    'http://localhost:3001'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // <-- responde ao preflight
  }

  next();
});

// Middleware para adicionar a instÃ¢ncia do banco de dados Ã s requisiÃ§Ãµes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de tratamento de erros JSON malformado
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON malformado',
      message: 'Verifique a sintaxe do JSON enviado'
    });
  }
  next(err);
});

// ========== ROTAS ==========
// sÃ³ mexa nessa parte
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Importando as rotas
// const loginRoutes = require('./routes/loginRoutes');
// app.use('/login', loginRoutes);

const menuRoutes = require('./routes/menuRoutes');
app.use('/menu', menuRoutes);

// const pessoaRoutes = require('./routes/pessoaRoutes');
// app.use('/pessoa', pessoaRoutes);

// const professorRoutes = require('./routes/professorRoutes');
// app.use('/professor', professorRoutes);

// const avaliadorRoutes = require('./routes/avaliadorRoutes');
// app.use('/avaliador', avaliadorRoutes);

// const avaliadoRoutes = require('./routes/avaliadoRoutes');
// app.use('/avaliado', avaliadoRoutes);

// const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
// app.use('/avaliacao', avaliacaoRoutes);

// const avaliacaoHasQuestaoRoutes = require('./routes/avaliacaoHasQuestaoRoutes');
// app.use('/avaliacaoHasQuestao', avaliacaoHasQuestaoRoutes);

const cargoRoutes = require('./routes/cargoRoutes');
app.use('/cargo', cargoRoutes);

const forma_pagamentoRoutes = require('./routes/forma_pagamentoRoutes');
app.use('/forma_pagamento', forma_pagamentoRoutes);

// Rotas de Pagamento
const pagamentoRoutes = require('./routes/pagamentoRoutes');
app.use('/pagamento', pagamentoRoutes);

// Rotas de Pagamento_has_forma_pagamento
const pagamento_has_forma_pagamentoRoutes = require('./routes/pagamento_has_forma_pagamentoRoutes');
app.use('/pagamento_has_forma_pagamento', pagamento_has_forma_pagamentoRoutes);

const produtoRoutes = require('./routes/produtoRoutes');
app.use('/produto', produtoRoutes);

const pedidoRoutes = require('./routes/pedidoRoutes');
app.use('/pedido', pedidoRoutes);

const pedido_has_produtoRoutes = require('./routes/pedido_has_produtoRoutes');
app.use('/pedido_has_produto', pedido_has_produtoRoutes);

// âœ… CORRIGIDO: Rota de pessoa (singular, nÃ£o plural)
const pessoaRoutes = require('./routes/pessoaRoutes');
app.use('/pessoa', pessoaRoutes);

// âœ… ADICIONADO: Rota de funcionÃ¡rio (necessÃ¡ria para o checkbox)
const funcionarioRoutes = require('./routes/funcionarioRoutes');
app.use('/funcionario', funcionarioRoutes);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ========== ROTAS PADRÃƒO ==========

// Rota padrÃ£o
app.get('/', (req, res) => {
  res.json({
    message: 'O server estÃ¡ funcionando - essa Ã© a rota raiz!',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// Rota para testar a conexÃ£o com o banco
app.get('/health', async (req, res) => {
  try {
    const connectionTest = await db.testConnection();

    if (connectionTest) {
      res.status(200).json({
        status: 'OK',
        message: 'Servidor e banco de dados funcionando',
        database: 'PostgreSQL',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        status: 'ERROR',
        message: 'Problema na conexÃ£o com o banco de dados',
        database: 'PostgreSQL',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Erro no health check:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Erro interno do servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ========== TRATAMENTO DE ERROS ==========

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro nÃ£o tratado:', err);

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas nÃ£o encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota nÃ£o encontrada',
    message: `A rota ${req.originalUrl} nÃ£o existe`,
    timestamp: new Date().toISOString()
  });
});

// ========== INICIALIZAÃ‡ÃƒO DO SERVIDOR ==========

// InicializaÃ§Ã£o do servidor
const startServer = async () => {
  try {
    // Testar conexÃ£o com o banco antes de iniciar o servidor
    console.log('Testando conexÃ£o com PostgreSQL...');
    const connectionTest = await db.testConnection();

    if (!connectionTest) {
      console.error('âŒ Falha na conexÃ£o com PostgreSQL');
      process.exit(1);
    }

    console.log('âœ… PostgreSQL conectado com sucesso');

    const PORT = process.env.PORT || PORT_FIXA;

    app.listen(PORT, () => {
      console.log(`ðŸš€ Servidor rodando em http://${HOST}:${PORT}`);
      console.log(`ðŸ“Š Health check disponÃ­vel em http://${HOST}:${PORT}/health`);
      console.log(`ðŸ“ Frontend: ${caminhoFrontend}`);
      console.log(`ðŸ“¸ Uploads: ${caminhoUploads}`);
      console.log(`ðŸ—„ï¸ Banco de dados: PostgreSQL`);
      console.log(`ðŸŒ Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('âŒ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais para encerramento graceful
process.on('SIGINT', async () => {
  console.log('\nðŸ”„ Encerrando servidor...');

  try {
    await db.pool.end();
    console.log('âœ… ConexÃµes com PostgreSQL encerradas');
    process.exit(0);
  } catch (error) {
    console.error('âŒ Erro ao encerrar conexÃµes:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\nðŸ”„ SIGTERM recebido, encerrando servidor...');

  try {
    await db.pool.end();
    console.log('âœ… ConexÃµes com PostgreSQL encerradas');
    process.exit(0);
  } catch (error) {
    console.error('âŒ Erro ao encerrar conexÃµes:', error);
    process.exit(1);
  }
});

// Iniciar o servidor
startServer();