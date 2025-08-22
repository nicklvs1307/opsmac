const express = require('express');
const rateLimit = require('express-rate-limit');
const { auth } = require('../../middleware/authMiddleware');
const authController = require('./auth.controller');
const { loginValidation, updateProfileValidation, changePasswordValidation } = require('domains/auth/auth.validation');

const router = express.Router();

// Rate limiting para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rotas de Autenticação
router.post('/login', authLimiter, loginValidation, authController.login);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, updateProfileValidation, authController.updateProfile);
router.put('/change-password', auth, changePasswordValidation, authController.changePassword);

module.exports = router;