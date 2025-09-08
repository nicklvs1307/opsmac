const { BadRequestError, NotFoundError } = require('utils/errors');

module.exports = (db) => {
    const models = db.models;

    const listNpsCriteria = async (restaurantId) => {
        return models.NpsCriterion.findAll({
            where: { restaurant_id: restaurantId },
            order: [['name', 'ASC']]
        });
    };

    const createNpsCriterion = async (name, restaurantId) => {
        const existingCriterion = await models.NpsCriterion.findOne({ where: { name, restaurant_id: restaurantId } });
        if (existingCriterion) {
            throw new BadRequestError('Este critério já existe.');
        }

        return models.NpsCriterion.create({
            name,
            restaurant_id: restaurantId,
        });
    };

    const updateNpsCriterion = async (id, name, restaurantId) => {
        const criterion = await models.NpsCriterion.findOne({ where: { id, restaurant_id: restaurantId } });

        if (!criterion) {
            throw new NotFoundError('Critério não encontrado.');
        }

        criterion.name = name;
        await criterion.save();

        return criterion;
    };

    const deleteNpsCriterion = async (id, restaurantId) => {
        const criterion = await models.NpsCriterion.findOne({ where: { id, restaurant_id: restaurantId } });

        if (!criterion) {
            throw new NotFoundError('Critério não encontrado.');
        }

        await criterion.destroy();
    };

    return {
        listNpsCriteria,
        createNpsCriterion,
        updateNpsCriterion,
        deleteNpsCriterion,
    };
};