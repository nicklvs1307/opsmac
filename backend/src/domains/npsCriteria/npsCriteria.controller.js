module.exports = (db) => {
    const npsCriteriaService = require('./npsCriteria.service')(db);
    const { validationResult } = require('express-validator');
    const { BadRequestError, ForbiddenError } = require('utils/errors');

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        listNpsCriteria: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                if (!restaurantId) {
                    throw new ForbiddenError('Usuário não está associado a um restaurante.');
                }
                const criteria = await npsCriteriaService.listNpsCriteria(restaurantId);
                res.json(criteria);
            } catch (error) {
                next(error);
            }
        },

        createNpsCriterion: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const { name } = req.body;
                const restaurantId = req.context.restaurantId;
                const newCriterion = await npsCriteriaService.createNpsCriterion(name, restaurantId);
                res.status(201).json(newCriterion);
            } catch (error) {
                next(error);
            }
        },

        updateNpsCriterion: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const { name } = req.body;
                const { id } = req.params;
                const restaurantId = req.context.restaurantId;
                const updatedCriterion = await npsCriteriaService.updateNpsCriterion(id, name, restaurantId);
                res.json(updatedCriterion);
            } catch (error) {
                next(error);
            }
        },

        deleteNpsCriterion: async (req, res, next) => {
            try {
                const { id } = req.params;
                const restaurantId = req.context.restaurantId;
                await npsCriteriaService.deleteNpsCriterion(id, restaurantId);
                res.json({ message: 'Critério removido com sucesso.' });
            } catch (error) {
                next(error);
            }
        },
    };
};
