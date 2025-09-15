import db from "#models";
import { Sequelize } from "sequelize";
import config from "./config";

module.exports = {
  sequelize: db.sequelize,
  models: db,
  testConnection: db.testConnection,
  syncDatabase: db.syncDatabase,
};
