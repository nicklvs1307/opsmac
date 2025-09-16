import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError, BadRequestError, NotFoundError } from "../utils/errors.js";
import logger from "../utils/logger.js";
import models from "../../models/index.js";
import cacheService from "../services/cacheService.js";
import { verifyToken } from "../services/jwtService.js";
import authServiceFactory from "../domains/auth/auth.service.js";

export default (db) => {
  const authService = authServiceFactory(db);

  const authMiddleware = async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");
      if (!authHeader) {
        return next(
          new UnauthorizedError("Acesso negado. Token não fornecido."),
        );
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;
      if (!token) {
        return next(
          new UnauthorizedError("Acesso negado. Formato do token inválido."),
        );
      }

      const isBlacklisted = await cacheService.get(`jwt_blacklist:${token}`);
      if (isBlacklisted) {
        return next(new UnauthorizedError("Token inválido ou revogado."));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new UnauthorizedError("Token inválido ou expirado."));
      }

      logger.info("Decoded userId:", decoded.userId);
      const user = await authService.getMe(decoded.userId);

      if (!user) {
        return next(new UnauthorizedError("Usuário do token não encontrado."));
      }

      if (!user.isActive) {
        return next(
          new ForbiddenError(
            "Acesso negado. A conta do usuário está desativada.",
          ),
        );
      }

      req.user = user;

      next();
    } catch (error) {
      logger.error("DEBUG: authMiddleware - error:", error);
      next(error);
    }
  };

  const checkRestaurantOwnership = async (req, res, next) => {
    try {
      const restaurantId = req.params.restaurantId || req.context?.restaurantId;
      if (!restaurantId) {
        return next(new BadRequestError("ID do restaurante não fornecido."));
      }

      const userRestaurantIds = req.user.restaurants.map((r) => r.id);
      const isOwner = req.user.isOwner;

      if (!userRestaurantIds.includes(restaurantId) && !isOwner) {
        return next(
          new ForbiddenError(
            "Acesso negado. Você não tem permissão para acessar este restaurante.",
          ),
        );
      }

      const restaurant = await db.Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        return next(new NotFoundError("Restaurante não encontrado."));
      }

      req.restaurant = restaurant;
      next();
    } catch (error) {
      logger.error("DEBUG: checkRestaurantOwnership - error:", error);
      next(error);
    }
  };

  return {
    auth: authMiddleware,
    checkRestaurantOwnership: checkRestaurantOwnership,
  };
};