const db = require('../../models');

module.exports = {
  sequelize: db.sequelize,
  models: db,
  testConnection: db.testConnection,
  syncDatabase: db.syncDatabase
};