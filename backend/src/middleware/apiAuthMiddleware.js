const { UnauthorizedError, InternalServerError } = require("utils/errors");
const logger = require("utils/logger");

module.exports = (db) => {
  const { models } = db;

  const apiAuth = async (req, res, next) => {
    const apiToken = req.header("x-api-key");

    if (!apiToken) {
      return next(
        new UnauthorizedError(
          "Nenhum token de API fornecido, autorização negada",
        ),
      );
    }

    try {
      const restaurant = await models.Restaurant.findOne({
        where: { api_token: apiToken },
      });

      if (!restaurant) {
        return next(new UnauthorizedError("Token de API inválido"));
      }

      req.restaurant = restaurant; // Anexa o objeto do restaurante à requisição
      next();
    } catch (err) {
      logger.error("Erro no middleware de autenticação de API:", err);
      next(
        new InternalServerError("Erro do servidor na autenticação de API", err),
      );
    }
  };

  return { apiAuth };
};
