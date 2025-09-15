require("dotenv").config();
const fs = require("fs");

// Adicionado para ler a senha do banco de dados a partir de um arquivo (Docker Secret)
let dbPassword = process.env.DB_PASSWORD;
if (process.env.NODE_ENV === "production" && process.env.DB_PASSWORD_FILE) {
  try {
    dbPassword = fs.readFileSync(process.env.DB_PASSWORD_FILE, "utf8").trim();
  } catch (e) {
    console.error("Falha ao ler o secret da senha do banco de dados:", e);
    process.exit(1);
  }
}

export default {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "123456789",
    database: process.env.DB_NAME || "feedback_restaurante",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false, // Changed from console.log to false
    underscored: true,
  },
  test: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "123456789",
    database: process.env.DB_NAME || "feedback_restaurante_test",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    underscored: true,
  },
  production: {
    username: process.env.DB_USER,
    password: dbPassword, // Modificado para usar a senha do secret
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    underscored: true,
  },
};
