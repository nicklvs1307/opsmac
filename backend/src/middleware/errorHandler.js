const { BaseError } = require("../utils/errors/BaseError"); // Corrected import path
import logger from "#utils/logger"; // Import logger

/**
 * Middleware de tratamento de erros centralizado.
 * Captura todos os erros passados pela função `next()` e formata a resposta HTTP.
 *
 * @param {Error} error - O objeto de erro.
 * @param {import('express').Request} req - O objeto de requisição do Express.
 * @param {import('express').Response} res - O objeto de resposta do Express.
 * @param {import('express').NextFunction} next - A próxima função de middleware.
 */
const errorHandler = (error, req, res, next) => {
  // Log the error for debugging purposes
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Default error values
  let statusCode = 500;
  let message = "Ocorreu um erro interno no servidor.";

  // Handle operational errors (e.g., BaseError, ApiError)
  if (error instanceof BaseError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.message && error.message.includes("Not allowed by CORS")) {
    // Handle CORS errors specifically
    statusCode = 403;
    message = "Requisição não permitida pela política de CORS.";
  }

  // Send the error response
  return res.status(statusCode).json({
    status: "error",
    message: message,
  });
};

module.exports = errorHandler;
