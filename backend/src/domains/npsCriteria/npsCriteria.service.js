import { BadRequestError, NotFoundError } from "../../utils/errors/index.js";

export default (db) => {
  const { NpsCriterion } = db;

  const listNpsCriteria = async (restaurantId) => {
    return NpsCriterion.findAll({
      where: { restaurantId },
      order: [["name", "ASC"]],
    });
  };

  const createNpsCriterion = async (name, restaurantId) => {
    const existingCriterion = await NpsCriterion.findOne({
      where: { name, restaurant_id: restaurantId },
    });
    if (existingCriterion) {
      throw new BadRequestError("Este critério já existe.");
    }

    return NpsCriterion.create({
      name,
      restaurantId,
    });
  };

  const updateNpsCriterion = async (id, name, restaurantId) => {
    const criterion = await NpsCriterion.findOne({
      where: { id, restaurantId },
    });

    if (!criterion) {
      throw new NotFoundError("Critério não encontrado.");
    }

    criterion.name = name;
    await criterion.save();

    return criterion;
  };

  const deleteNpsCriterion = async (id, restaurantId) => {
    const criterion = await NpsCriterion.findOne({
      where: { id, restaurantId },
    });

    if (!criterion) {
      throw new NotFoundError("Critério não encontrado.");
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
