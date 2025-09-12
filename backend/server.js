const path = require('path');
require('./aliases');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan'); // Import morgan
require('dotenv').config();

const db = require('models');
const { BaseError } = require('utils/errors');
const logger = require('utils/logger'); // Import logger

// Importação de Rotas
const routes = require('./routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Middlewares Globais
app.use(helmet({ crossOriginResourcePolicy: false }));

// Add Morgan for request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://feedelizapro.towersfy.com'
].filter(Boolean);

// Configuração de CORS centralizada e robusta
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

// Inicializar servidor
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    logger.info('✅ Conexão com banco de dados estabelecida'); // Use logger
    
    // Configuração das Rotas
    app.use("/api", routes(db));

    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`); // Use logger
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error); // Use logger
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🔄 Encerrando servidor...'); // Use logger
  await db.sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🔄 Encerrando servidor...'); // Use logger
  await db.sequelize.close();
  process.exit(0);
});

module.exports = app;