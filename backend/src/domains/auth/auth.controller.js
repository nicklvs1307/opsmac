const { BadRequestError } = require('utils/errors');
const { loginValidation, updateProfileValidation, changePasswordValidation } = require('domains/auth/auth.validation');
const { validationResult } = require('express-validator');

module.exports = (db) => {
    
    const authService = require('./auth.service')(db);

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    const login = async (req, res, next) => {
        handleValidationErrors(req);
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.json({
            message: 'Login realizado com sucesso',
            ...result,
        });
    };

    const getMe = async (req, res, next) => {
        // O middleware de autenticação já anexa o usuário à requisição (req.user).
        // Não há necessidade de chamar authService.getMe novamente aqui.
        res.json({ user: req.user });
    };

    const updateProfile = async (req, res, next) => {
        handleValidationErrors(req);
        const { name, phone, avatar } = req.body;
        const updatedUser = await authService.updateProfile(req.user.userId, { name, phone, avatar });

        res.json({
            message: 'Perfil atualizado com sucesso',
            user: updatedUser
        });
    };

    const changePassword = async (req, res, next) => {
        handleValidationErrors(req);
        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(req.user.userId, currentPassword, newPassword);

        res.json({ message: 'Senha alterada com sucesso' });
    };

    const logout = (req, res) => {
        // For stateless JWT, logout is handled client-side by deleting the token.
        // This endpoint can be kept for semantics, but it doesn't need to do anything on the server.
        res.status(200).json({ success: true, message: 'Logout realizado com sucesso' });
    };

    return {
        login,
        getMe,
        updateProfile,
        changePassword,
        logout,
    };
};