import { BadRequestError, NotFoundError } from "../../utils/errors/index.js";

export default (db) => {
  const { NpsCriterion } = db;

  const _getNpsCriterionById = async (id, restaurantId, t = null) => {
    const criterion = await NpsCriterion.findOne({
      where: { id, restaurantId },
      ...(t && { transaction: t }),
    });
    if (!criterion) {
      throw new NotFoundError("Critério NPS não encontrado.");
    }
    return criterion;
  };

  const _checkNpsCriterionNameUniqueness = async (name, restaurantId, excludeCriterionId = null, t = null) => {
    const where = { name, restaurantId };
    if (excludeCriterionId) {
      where.id = { [Op.ne]: excludeCriterionId };
    }
    const existingCriterion = await NpsCriterion.findOne({ where, ...(t && { transaction: t }) });
    if (existingCriterion) {
      throw new BadRequestError("Já existe um critério NPS com este nome para este restaurante.");
    }
  };

  const listNpsCriteria = async (restaurantId) => {
    return NpsCriterion.findAll({
      where: { restaurantId },
      order: [["name", "ASC"]],
    });
  };

  const createNpsCriterion = async (name, restaurantId) => {
    const t = await db.sequelize.transaction();
    try {
      await _checkNpsCriterionNameUniqueness(name, restaurantId, null, t);

      const newCriterion = await NpsCriterion.create({
        name,
        restaurantId,
      }, { transaction: t });

      await t.commit();
      return newCriterion;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  const updateNpsCriterion = async (id, name, restaurantId) => {
    const t = await db.sequelize.transaction();
    try {
      const criterion = await _getNpsCriterionById(id, restaurantId, t);

      if (criterion.name !== name) {
        await _checkNpsCriterionNameUniqueness(name, restaurantId, id, t);
        criterion.name = name;
        await criterion.save({ transaction: t });
      }

      await t.commit();
      return criterion;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  const deleteNpsCriterion = async (id, restaurantId) => {
    const t = await db.sequelize.transaction();
    try {
      const criterion = await _getNpsCriterionById(id, restaurantId, t);

      await criterion.destroy({ transaction: t });

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  return {
    listNpsCriteria,
    createNpsCriterion,
    updateNpsCriterion,
    deleteNpsCriterion,
  };
};
