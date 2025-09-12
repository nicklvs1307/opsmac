module.exports = (db) => {
    const models = db;
    const { Op } = require('sequelize');
    const { BadRequestError, NotFoundError } = require('utils/errors');

    const listSegments = async (restaurantId) => {
        const segments = await models.CustomerSegment.findAll({
            where: { restaurantId },
        });
        return segments;
    };

    const getSegmentById = async (segmentId, restaurantId) => {
        const segment = await models.CustomerSegment.findOne({
            where: { id: segmentId, restaurantId },
        });
        if (!segment) {
            throw new NotFoundError('Segmento não encontrado.');
        }
        return segment;
    };

    const createSegment = async (segmentData, restaurantId) => {
        const { name, description, rules } = segmentData;
        const newSegment = await models.CustomerSegment.create({
            name,
            description,
            rules,
            restaurantId,
        });
        return newSegment;
    };

    const updateSegment = async (segmentId, updateData, restaurantId) => {
        const segment = await getSegmentById(segmentId, restaurantId);
        await segment.update(updateData);
        return segment;
    };

    const deleteSegment = async (segmentId, restaurantId) => {
        const segment = await getSegmentById(segmentId, restaurantId);
        await segment.destroy();
        return { message: 'Segmento excluído com sucesso.' };
    };

    // Function to apply segmentation rules to customers
    const applySegmentationRules = async (restaurantId) => {
        const segments = await models.CustomerSegment.findAll({
            where: { restaurantId },
        });

        const customers = await models.Customer.findAll({
            where: { restaurantId },
        });

        for (const customer of customers) {
            let assignedSegment = 'default'; // Default segment if no rules match

            for (const segment of segments) {
                let rulesMatch = true;
                if (segment.rules && segment.rules.length > 0) {
                    for (const rule of segment.rules) {
                        // Basic rule evaluation (can be expanded for more complex rules)
                        if (rule.field === 'totalVisits' && customer.totalVisits < rule.value) {
                            rulesMatch = false;
                            break;
                        }
                        if (rule.field === 'totalSpent' && customer.totalSpent < rule.value) {
                            rulesMatch = false;
                            break;
                        }
                        if (rule.field === 'loyaltyPoints' && customer.loyaltyPoints < rule.value) {
                            rulesMatch = false;
                            break;
                        }
                        // Add more rule types as needed (e.g., lastVisit, feedbackRating)
                    }
                } else {
                    // If no rules defined, this segment doesn't apply based on rules
                    rulesMatch = false;
                }

                if (rulesMatch) {
                    assignedSegment = segment.name; // Assign the first matching segment
                    break; // Assign to the first matching segment and move to next customer
                }
            }
            if (customer.segment !== assignedSegment) {
                await customer.update({ segment: assignedSegment });
            }
        }
        return { message: 'Regras de segmentação aplicadas com sucesso.' };
    };

    return {
        listSegments,
        getSegmentById,
        createSegment,
        updateSegment,
        deleteSegment,
        applySegmentationRules,
    };
};