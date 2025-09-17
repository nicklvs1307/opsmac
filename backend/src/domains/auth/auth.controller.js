import { BadRequestError } from "../../utils/errors.js";
import { validationResult } from "express-validator";

import authServiceFactory from "./auth.service.js";

// auth.validation is not directly used here, but its validation results are.
// So, we don't need to require loginValidation, updateProfileValidation, changePasswordValidation here.

export default (db) => {
  const authService = authServiceFactory(db);

  class AuthController {
    constructor() {
      // Bind methods to the instance to ensure 'this' context is correct when used as Express middleware
      this.login = this.login.bind(this);
      this.getMe = this.getMe.bind(this);
      this.updateProfile = this.updateProfile.bind(this);
      this.changePassword = this.changePassword.bind(this);
      this.logout = this.logout.bind(this);
    }

    _handleValidationErrors(req) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new BadRequestError("Dados inválidos", errors.array());
      }
    }

    async login(req, res, next) {
      this._handleValidationErrors(req);
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        message: "Login realizado com sucesso",
        ...result,
      });
    }

    async getMe(req, res, next) {
      // The authentication middleware already attaches the user to the request (req.user).
      // No need to call authService.getMe again here.
      res.json({ user: req.user });
    }

    async updateProfile(req, res, next) {
      this._handleValidationErrors(req);
      const { name, phone, avatar } = req.body;
      const updatedUser = await authService.updateProfile(req.user.userId, {
        name,
        phone,
        avatar,
      });

      res.json({
        message: "Perfil atualizado com sucesso",
        user: updatedUser,
      });
    }

    async changePassword(req, res, next) {
      this._handleValidationErrors(req);
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword,
      );

      res.json({ message: "Senha alterada com sucesso" });
    }

    async logout(req, res, next) {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (token) {
        await authService.logout(token);
      }
      res
        .status(200)
        .json({ success: true, message: "Logout realizado com sucesso" });
    }
  }

  return new AuthController();
};
