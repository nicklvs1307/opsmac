'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes, Sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Função para testar conexão
db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    // console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
    throw error; // Re-lança o erro para que a inicialização do servidor possa capturá-lo
  }
};

// Função para sincronizar banco
db.syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    // console.log('✅ Banco de dados sincronizado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco:', error);
    throw error;
  }
};

module.exports = db;
