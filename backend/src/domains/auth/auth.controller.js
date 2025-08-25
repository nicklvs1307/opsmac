const authService = require('./auth.service');
const { BadRequestError } = require('utils/errors');
const { loginValidation, updateProfileValidation, changePasswordValidation } = require('domains/auth/auth.validation');
const { validationResult } = require('express-validator');

const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new BadRequestError('Dados inválidos', errors.array());
    }
};

const login = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
      message: 'Login realizado com sucesso',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
    try {
        handleValidationErrors(req);
        const { name, phone, avatar } = req.body;
        const updatedUser = await authService.updateProfile(req.user.userId, { name, phone, avatar });

        res.json({
            message: 'Perfil atualizado com sucesso',
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        handleValidationErrors(req);
        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(req.user.userId, currentPassword, newPassword);

        res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  login,
  getMe,
  updateProfile,
  changePassword,
};
