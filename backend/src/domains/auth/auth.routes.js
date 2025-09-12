const express = require('express');
const rateLimit = require('express-rate-limit');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
    const authController = require('domains/auth/auth.controller')(db);
    const { loginValidation, updateProfileValidation, changePasswordValidation } = require('domains/auth/auth.validation');

    const router = express.Router();

    const authLimiter = rateLimit({
        windowMs: (process.env.AUTH_RATE_LIMIT_WINDOW || 15) * 60 * 1000,
        max: process.env.AUTH_RATE_LIMIT_MAX || 20,
        message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
        standardHeaders: true,
        legacyHeaders: false
    });

    router.post('/login', authLimiter, ...loginValidation, asyncHandler(authController.login));
    router.get('/me', asyncHandler(authController.getMe));
    router.put('/profile', ...updateProfileValidation, asyncHandler(authController.updateProfile));
    router.put('/change-password', ...changePasswordValidation, asyncHandler(authController.changePassword));
    router.post('/logout', asyncHandler(authController.logout));

    return router;
};