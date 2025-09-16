import { ForbiddenError } from "../utils/errors/index.js"; // Importar ForbiddenError

export const requireAdminOrSuperadmin = (req, res, next) => {
  if (!req.user) {
    return next(new ForbiddenError("Acesso negado. Usuário não autenticado."));
  }
  // Verifica se o usuário é superadmin ou tem uma role de administrador
  if (
    req.user.isSuperadmin ||
    (req.user.roles && req.user.roles.some((role) => role.key === "admin"))
  ) {
    // Assumindo que roles é um array de objetos com 'key'
    next();
  } else {
    return next(
      new ForbiddenError(
        "Acesso negado. Apenas administradores ou superadministradores podem realizar esta ação.",
      ),
    );
  }
};

export const requireSuperadmin = (req, res, next) => {
  if (!req.user) {
    return next(new ForbiddenError("Acesso negado. Usuário não autenticado."));
  }
  if (req.user.isSuperadmin) {
    next();
  } else {
    return next(
      new ForbiddenError(
        "Acesso negado. Apenas superadministradores podem realizar esta ação.",
      ),
    );
  }
};
