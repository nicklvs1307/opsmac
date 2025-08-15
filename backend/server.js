const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); // Adicionado
require('dotenv').config();

const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const dashboardRoutes = require('./routes/dashboard');
const rewardsRoutes = require('./routes/rewards');
const qrcodeRoutes = require('./routes/qrcode');
const whatsappRoutes = require('./routes/whatsapp');
const customerRoutes = require('./routes/customers');
const settingsRoutes = require('./routes/settings');
const couponsRoutes = require('./routes/coupons');
const checkinRoutes = require('./routes/checkin');
const publicRoutes = require('./routes/public');
const publicRoutesV2 = require('./routes/public_v2');
const surveyRoutes = require('./routes/surveys');
const publicSurveyRoutes = require('./routes/public_surveys');
const adminRoutes = require('./routes/admin');
const npsCriteriaRoutes = require('./routes/npsCriteria');
const ifoodRoutes = require('./routes/ifood');
const googleMyBusinessRoutes = require('./routes/googleMyBusiness');
const saiposRoutes = require('./routes/saipos');
const uaiRangoRoutes = require('./routes/uaiRango');
const deliveryMuchRoutes = require('./routes/deliveryMuch');
const productRoutes = require('./routes/products');
const publicProductsRoutes = require('./routes/public_products');
const stockRoutes = require('./routes/stock');
const tablesRoutes = require('./routes/tables');
const publicDineInMenuRoutes = require('./routes/public_dine_in_menu');
const publicDineInOrdersRoutes = require('./routes/public_dine_in_orders');
const publicOrdersRoutes = require('./routes/public_orders');
const ordersRoutes = require('./routes/orders');
const ingredientsRoutes = require('./routes/ingredients');
const technicalSpecificationsRoutes = require('./routes/technicalSpecifications');
const categoriesRoutes = require('./routes/categories');
const labelRoutes = require('./routes/labels');

const app = express();
app.set('trust proxy', 1); // Confia no proxy reverso (Traefik)
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutos
  max: process.env.RATE_LIMIT_MAX || 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.'
  }
});

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://feedelizapro.towersfy.com',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/qrcode', qrcodeRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/public', publicRoutes);
app.use('/api/public/v2', publicRoutesV2);
app.use('/api/surveys', surveyRoutes);
app.use('/api/public/surveys', publicSurveyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/nps-criteria', npsCriteriaRoutes);
app.use('/api/ifood', ifoodRoutes);
app.use('/api/google-my-business', googleMyBusinessRoutes);
app.use('/api/saipos', saiposRoutes);
app.use('/api/uai-rango', uaiRangoRoutes);
app.use('/api/delivery-much', deliveryMuchRoutes);
app.use('/api/products', productRoutes);
app.use('/api/public/products', publicProductsRoutes);
app.use('/api/public/orders', publicOrdersRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/public/menu/dine-in', publicDineInMenuRoutes);
app.use('/api/public/dine-in', publicDineInOrdersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/ingredients', ingredientsRoutes);
app.use('/api/technical-specifications', technicalSpecificationsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/labels', labelRoutes);

const restaurantRoutes = require('./routes/restaurant');
const healthRoutes = require('./routes/health');

app.use('/api/restaurant', restaurantRoutes);
app.use('/api/health', healthRoutes);

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Token inválido ou expirado'
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');
    
    // Sincronizar modelos (DESATIVADO PARA USAR MIGRAÇÕES)
    // await sequelize.sync({ alter: true });
    // console.log('✅ Modelos sincronizados com o banco');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Dashboard: ${process.env.FRONTEND_URL || 'https://feedelizapro.towersfy.com'}`);
      console.log(`🔗 API: https://feedelizaapi.towersfy.com/api`);
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