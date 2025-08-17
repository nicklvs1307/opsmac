const { models } = require('../config/database');

const isWaiter = async (req, res, next) => {
    try {
        const { userId } = req.user; // Vem do middleware de autenticação `auth`

        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        if (user.role === 'waiter') {
            req.restaurantId = user.restaurant_id;
            return next();
        }

        return res.status(403).json({ error: 'Acesso negado. Rota exclusiva para garçons.' });

    } catch (error) {
        console.error('Erro na verificação de permissão de garçom:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

module.exports = { isWaiter };
