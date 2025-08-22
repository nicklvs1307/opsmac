const { models } = require('../config/database');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/errors');

exports.listNpsCriteria = async (restaurantId) => {
  const criteria = await models.NpsCriterion.findAll({
    where: { restaurant_id: restaurantId },
    order: [['name', 'ASC']]
  });
  return criteria;
};

exports.createNpsCriterion = async (name, restaurantId) => {
  const existingCriterion = await models.NpsCriterion.findOne({ where: { name, restaurant_id: restaurantId } });
  if (existingCriterion) {
    throw new BadRequestError('Este critério já existe.');
  }

  const newCriterion = await models.NpsCriterion.create({
    name,
    restaurant_id: restaurantId,
  });
  return newCriterion;
};

exports.updateNpsCriterion = async (id, name, restaurantId) => {
  let criterion = await models.NpsCriterion.findOne({ where: { id, restaurant_id: restaurantId } });

  if (!criterion) {
    throw new NotFoundError('Critério não encontrado.');
  }

  criterion.name = name;
  await criterion.save();

  return criterion;
};

exports.deleteNpsCriterion = async (id, restaurantId) => {
  const criterion = await models.NpsCriterion.findOne({ where: { id, restaurant_id: restaurantId } });

  if (!criterion) {
    throw new NotFoundError('Critério não encontrado.');
  }

  await criterion.destroy();
};