const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./src/config/database');
const { BaseError } = require('./utils/errors');

// Importação de Rotas
const allRoutes = require('./routes'); // Import the consolidated routes

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Middlewares Globais
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://feedelizapro.towersfy.com',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const apiLimiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' }
});
app.use('/api/', apiLimiter);

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Configuração das Rotas
allRoutes.forEach(route => {
  app.use(route.path, route.router);
});

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota 404 - Deve vir antes do tratador de erros
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware de Tratamento de Erros - O CORAÇÃO DA PADRONIZAÇÃO
app.use((err, req, res, next) => {
  console.error('Error caught by middleware:', err);

  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Fallback para outros tipos de erros comuns
  if (err.name === 'ValidationError') { // Erro de validação do Sequelize
    return res.status(400).json({ error: 'Dados inválidos', details: err.errors.map(e => e.message) });
  }
  
  if (err.name === 'UnauthorizedError') { // Erro do JWT
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  // Erro genérico de servidor
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Encerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Encerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

module.exports = app;
