const { BadRequestError } = require("utils/errors");
const { validationResult } = require("express-validator");

// auth.validation is not directly used here, but its validation results are.
// So, we don't need to require loginValidation, updateProfileValidation, changePasswordValidation here.

module.exports = (db) => {
  const authService = require("./auth.service")(db);

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
      try {
        this._handleValidationErrors(req);
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.json({
          message: "Login realizado com sucesso",
          ...result,
        });
      } catch (error) {
        next(error);
      }
    }

    async getMe(req, res, next) {
      try {
        // The authentication middleware already attaches the user to the request (req.user).
        // No need to call authService.getMe again here.
        res.json({ user: req.user });
      } catch (error) {
        next(error);
      }
    }

    async updateProfile(req, res, next) {
      try {
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
      } catch (error) {
        next(error);
      }
    }

    async changePassword(req, res, next) {
      try {
        this._handleValidationErrors(req);
        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(
          req.user.userId,
          currentPassword,
          newPassword,
        );

        res.json({ message: "Senha alterada com sucesso" });
      } catch (error) {
        next(error);
      }
    }

    logout(req, res, next) {
      try {
        // For stateless JWT, logout is handled client-side by deleting the token.
        // This endpoint can be kept for semantics, but it doesn't need to do anything on the server.
        res
          .status(200)
          .json({ success: true, message: "Logout realizado com sucesso" });
      } catch (error) {
        next(error);
      }
    }
  }

  return new AuthController();
};