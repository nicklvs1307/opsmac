const express = require('express');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('middleware/authMiddleware');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
    const authController = require('domains/auth/auth.controller')(db);
    const { loginValidation, updateProfileValidation, changePasswordValidation } = require('domains/auth/auth.validation');

    const router = express.Router();

    const { auth } = authMiddleware(db);

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
        standardHeaders: true,
        legacyHeaders: false
    });

    router.post('/login', authLimiter, ...loginValidation, asyncHandler(authController.login));
    router.get('/me', auth, asyncHandler(authController.getMe));
    router.put('/profile', auth, ...updateProfileValidation, asyncHandler(authController.updateProfile));
    router.put('/change-password', auth, ...changePasswordValidation, asyncHandler(authController.changePassword));
    router.post('/logout', asyncHandler(authController.logout));

    return router;
};