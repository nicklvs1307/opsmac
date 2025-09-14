"use strict";
const iamService = require("../services/iamService");
const {
  UnauthorizedError,
  ForbiddenError,
  PaymentRequiredError,
} = require("utils/errors"); // Importar erros customizados
// const models = require('models'); // Remover esta linha, não é mais necessária aqui

const requirePermission = (featureKey, actionKey) => {
  return async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
      return next(
        new UnauthorizedError("Acesso negado. Usuário não autenticado."),
      );
    }

    // Add Super Admin bypass logic
    if (req.user.isSuperadmin) {
      // Super admin bypasses all permission and restaurant context checks
      return next();
    }

    // Restaurant context is required for non-superadmins
    const restaurantId = req.context?.restaurantId || req.user.restaurantId; // Priorizar req.context
    if (!restaurantId) {
      return next(
        new UnauthorizedError(
          "Acesso negado. Contexto do restaurante ausente.",
        ),
      );
    }

    const result = await iamService.checkPermission(
      restaurantId,
      userId,
      featureKey,
      actionKey,
    );

    if (result.allowed) {
      return next();
    }

    if (result.locked) {
      return next(
        new PaymentRequiredError(
          "Recurso bloqueado. Pagamento necessário.",
          result.reason,
        ),
      ); // Usar PaymentRequiredError
    } else {
      return next(
        new ForbiddenError(
          "Acesso negado. Você não tem permissão para realizar esta ação.",
          result.reason,
        ),
      ); // Usar ForbiddenError
    }
  };
};

module.exports = requirePermission;
