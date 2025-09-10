module.exports = (db) => {
    const npsCriteriaService = require('./npsCriteria.service')(db);
    const { validationResult } = require('express-validator');
    const { BadRequestError, ForbiddenError } = require('utils/errors');
    const auditService = require('../../services/auditService'); // Import auditService

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        listNpsCriteria: async (req, res, next) => {
            const restaurantId = req.context.restaurantId;
            if (!restaurantId) {
                throw new ForbiddenError('Usuário não está associado a um restaurante.');
            }
            const criteria = await npsCriteriaService.listNpsCriteria(restaurantId);
            res.json(criteria);
        },

        createNpsCriterion: async (req, res, next) => {
            handleValidationErrors(req);
            const { name } = req.body;
            const restaurantId = req.context.restaurantId;
            const newCriterion = await npsCriteriaService.createNpsCriterion(name, restaurantId);
            await auditService.log(req.user, restaurantId, 'NPS_CRITERION_CREATED', `Criterion:${newCriterion.id}`, { name });
            res.status(201).json(newCriterion);
        },

        updateNpsCriterion: async (req, res, next) => {
            handleValidationErrors(req);
            const { name } = req.body;
            const { id } = req.params;
            const restaurantId = req.context.restaurantId;
            const updatedCriterion = await npsCriteriaService.updateNpsCriterion(id, name, restaurantId);
            await auditService.log(req.user, restaurantId, 'NPS_CRITERION_UPDATED', `Criterion:${updatedCriterion.id}`, { name });
            res.json(updatedCriterion);
        },

        deleteNpsCriterion: async (req, res, next) => {
            const { id } = req.params;
            const restaurantId = req.context.restaurantId;
            await npsCriteriaService.deleteNpsCriterion(id, restaurantId);
            await auditService.log(req.user, restaurantId, 'NPS_CRITERION_DELETED', `Criterion:${id}`, {});
            res.json({ message: 'Critério removido com sucesso.' });
        },
    };
};
