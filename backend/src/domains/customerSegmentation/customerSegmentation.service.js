export default (db) => {
  const models = db;
  const sequelize = db.sequelize;
  import { Op } from "sequelize";
  import { BadRequestError, NotFoundError } from "../../utils/errors.js";
  import logger from "../../utils/logger.js";

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
      throw new NotFoundError("Segmento não encontrado.");
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
    return { message: "Segmento excluído com sucesso." };
  };

  const applySegmentationRules = async (restaurantId) => {
    const segments = await models.CustomerSegment.findAll({
      where: { restaurantId },
      order: [["priority", "DESC"]], // Process higher priority segments first
    });

    if (!segments || segments.length === 0) {
      return { message: "Nenhum segmento para aplicar." };
    }

    const transaction = await db.sequelize.transaction();

    try {
      // Reset all customers in this restaurant to a default segment first
      await models.Customer.update(
        { segment: "default" },
        { where: { restaurantId }, transaction },
      );

      for (const segment of segments) {
        if (!segment.rules || segment.rules.length === 0) {
          continue; // Skip segments with no rules
        }

        const whereClause = {
          restaurantId,
          [Op.and]: segment.rules.map((rule) => {
            // Ensure operator is a valid Sequelize operator, default to gte
            const operator = Op[rule.operator] || Op.gte;
            return { [rule.field]: { [operator]: rule.value } };
          }),
        };

        await models.Customer.update(
          { segment: segment.name },
          { where: whereClause, transaction },
        );
      }

      await transaction.commit();
      return { message: "Regras de segmentação aplicadas com sucesso." };
    } catch (error) {
      await transaction.rollback();
      logger.error("Erro ao aplicar regras de segmentação:", error);
      throw new Error("Falha ao aplicar regras de segmentação.");
    }
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