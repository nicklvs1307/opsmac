const { models } = require('../config/database');

const isOwnerOrManager = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const { userId } = req.user; // Vem do middleware de autenticação `auth`

        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // O super admin pode gerenciar qualquer restaurante
        if (user.role === 'super_admin') {
            return next();
        }

        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurante não encontrado.' });
        }

        // Verifica se o usuário é o dono do restaurante ou um gerente do restaurante
        const isOwner = restaurant.owner_id === userId;
        const isManager = user.role === 'manager' && user.restaurant_id === restaurantId;

        if (isOwner || isManager) {
            req.restaurant = restaurant; // Anexa o restaurante ao request para uso posterior
            return next();
        }

        return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para gerenciar este restaurante.' });

    } catch (error) {
        console.error('Erro na verificação de permissão:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

module.exports = { isOwnerOrManager };
