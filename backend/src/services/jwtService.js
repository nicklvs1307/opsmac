import jwt from "jsonwebtoken";
import fs from "fs";
import { UnauthorizedError } from "../utils/errors.js";
import logger from "../utils/logger.js";

let cachedSecret = null;

const _getJwtSecret = () => {
  if (cachedSecret) {
    return cachedSecret;
  }

  let secret;
  if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET_FILE) {
    try {
      secret = fs.readFileSync(process.env.JWT_SECRET_FILE, "utf8").trim();
      if (secret.length === 0) {
        logger.error("Secret read from file is an empty string after trim!");
      }
    } catch (error) {
      logger.error("Error reading JWT secret file:", error);
      throw new Error("Erro ao ler o segredo JWT do arquivo.");
    }
  } else if (process.env.JWT_SECRET) {
    secret = process.env.JWT_SECRET;
  } else {
    throw new Error(
      "JWT_SECRET não está definido no .env ou no arquivo de segredo.",
    );
  }

  if (!secret) {
    logger.error("Final secret is empty or undefined!");
    throw new Error("JWT_SECRET não está definido.");
  }
  cachedSecret = secret;
  return secret;
};

export const generateToken = (userId) => {
  const secret = _getJwtSecret();
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const verifyToken = (token) => {
  const secret = _getJwtSecret();
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new UnauthorizedError("Token inválido ou expirado.");
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};