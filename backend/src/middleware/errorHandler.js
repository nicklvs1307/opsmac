const { BaseError } = require('../utils/errors');

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
  // Se o erro é uma instância de nossos erros customizados, nós confiamos na mensagem e no status code.
  if (error instanceof BaseError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  // Para erros inesperados (erros de sistema, bugs), nós logamos o erro para depuração
  // e enviamos uma resposta genérica para o cliente, para não expor detalhes da implementação.
  console.error('ERRO INESPERADO:', error);

  return res.status(500).json({
    status: 'error',
    message: 'Ocorreu um erro interno no servidor.',
  });
};

module.exports = errorHandler;
