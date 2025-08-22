const { models } = require('config/database');

const isPdvUser = async (req, res, next) => {
    try {
        const { userId } = req.user; // Vem do middleware de autenticação `auth`

        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const allowedRoles = ['waiter', 'manager', 'owner'];
        if (allowedRoles.includes(user.role)) {
            req.restaurantId = user.restaurant_id;
            return next();
        }

        return res.status(403).json({ error: 'Acesso negado. Rota exclusiva para usuários do PDV.' });

    } catch (error) {
        console.error('Erro na verificação de permissão do PDV:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

module.exports = { isPdvUser };