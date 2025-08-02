const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'feedback_restaurante',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456789',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Importar modelos
const User = require('../models/User')(sequelize);
const Restaurant = require('../models/Restaurant')(sequelize);
const Feedback = require('../models/Feedback')(sequelize);
const Customer = require('../models/Customer')(sequelize);
const Reward = require('../models/Reward')(sequelize);
const Coupon = require('../models/Coupon')(sequelize);
const QRCode = require('../models/QRCode')(sequelize);
const Checkin = require('../models/Checkin')(sequelize);
const Survey = require('../models/Survey')(sequelize);
const Question = require('../models/Question')(sequelize);
const SurveyResponse = require('../models/SurveyResponse')(sequelize);
const Answer = require('../models/Answer')(sequelize);
const WhatsAppMessage = require('../models/WhatsAppMessage')(sequelize); // Importar o novo modelo

// Definir associações
Coupon.belongsTo(Reward, { foreignKey: 'reward_id', as: 'reward' });
Reward.hasMany(Coupon, { foreignKey: 'reward_id', as: 'coupons' });

const setupAssociations = () => {
  Object.keys(sequelize.models).forEach(modelName => {
    if (sequelize.models[modelName].associate) {
      sequelize.models[modelName].associate(sequelize.models);
    }
  });
};

setupAssociations();

// Função para testar conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
    return false;
  }
};

// Função para sincronizar banco
const syncDatabase = async (force = false) => {
  try {
    // Criar ENUM type manualmente se não existir, para evitar problemas com alter: true no Postgres
    

    

    await sequelize.query(`CREATE TYPE IF NOT EXISTS "public"."enum_coupons_reward_type" AS ENUM('discount_percentage', 'discount_fixed', 'free_item', 'points', 'cashback', 'gift', 'spin_the_wheel');`);
    console.log('✅ Tipo ENUM "enum_coupons_reward_type" verificado/criado.');

    await sequelize.sync({ force });
    console.log('✅ Banco de dados sincronizado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  models: {
    User,
    Restaurant,
    Feedback,
    Customer,
    Reward,
    Coupon,
    QRCode,
    Checkin,
    Survey,
    Question,
    SurveyResponse,
    Answer,
    WhatsAppMessage // Adicionar o novo modelo aqui
  },
  testConnection,
  syncDatabase
};