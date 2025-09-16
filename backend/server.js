import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

import db from "./models/index.js";
import { BaseError } from "./src/utils/errors.js";
import logger from "./src/utils/logger.js";
import { initCacheInvalidator, subscriberClient, } from "./src/jobs/cacheInvalidator.js";

// Importação de Rotas
import routes from "./routes/index.js";
import errorHandler from "./src/middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// Middlewares Globais
app.use(helmet({ crossOriginResourcePolicy: false }));

// Add Morgan for request logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://feedelizapro.towersfy.com",
].filter(Boolean);

// Configuração de CORS centralizada e robusta
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const apiLimiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
});
app.use("/api/", apiLimiter);

// Servir arquivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Swagger UI
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./src/config/swagger.js";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

// Inicializar servidor
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    logger.info("✅ Conexão com banco de dados estabelecida"); // Use logger

    // Initialize cache invalidator
    await initCacheInvalidator();

    // Configuração das Rotas
    const apiRoutes = await routes(db);
    app.use("/api", apiRoutes);

    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`); // Use logger
    });
  } catch (error) {
    logger.error("❌ Erro ao iniciar servidor:", error); // Use logger
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("🔄 Encerrando servidor..."); // Use logger
  await db.sequelize.close();
  await subscriberClient.quit(); // Close Redis subscriber client
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("🔄 Encerrando servidor..."); // Use logger
  await db.sequelize.close();
  await subscriberClient.quit(); // Close Redis subscriber client
  process.exit(0);
});

export default app;
