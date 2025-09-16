import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import logger from "../src/utils/logger.js";
import _config from "../src/config/config.js";
import { fileURLToPath, pathToFileURL } from 'url';

const basename = path.basename(import.meta.url);
const env = process.env.NODE_ENV || "development";
const config = _config[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const modelFiles = fs.readdirSync(currentDir).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.slice(-3) === ".js" &&
    file.indexOf(".test.js") === -1
  );
});

for (const file of modelFiles) {
  const routeURL = pathToFileURL(path.join(currentDir, file)).href;
  const model = (await import(routeURL)).default(
    sequelize,
    Sequelize.DataTypes,
    Sequelize,
  );
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
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
    logger.info("✅ Conexão com PostgreSQL estabelecida com sucesso");
    return true;
  } catch (error) {
    logger.error("❌ Erro ao conectar com PostgreSQL:", error.message);
    throw error; // Re-lança o erro para que a inicialização do servidor possa capturá-lo
  }
};

// Função para sincronizar banco
db.syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.info("✅ Banco de dados sincronizado");
    return true;
  } catch (error) {
    logger.error("❌ Erro ao sincronizar banco:", error);
    throw error;
  }
};

export default db;