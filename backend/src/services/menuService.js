const { models } = require('../config/database');

let cachedMenuHierarchy = null;
let lastCacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const getModuleHierarchy = async () => {
  const now = Date.now();
  if (cachedMenuHierarchy && (now - lastCacheTime < CACHE_DURATION)) {
    return cachedMenuHierarchy;
  }

  const allModulesWithHierarchy = await models.Module.findAll({
    include: [
      {
        model: models.Submodule,
        as: 'Submodules',
        include: [{
          model: models.Feature,
          as: 'features',
          attributes: ['id', 'name', 'description', 'path'],
        }],
        attributes: ['id', 'name', 'description', 'displayName'],
      },
      {
        model: models.Feature,
        as: 'features', // Features directly under module
        attributes: ['id', 'name', 'description', 'path'],
        where: { submoduleId: null }, // Only features not linked to a submodule
        required: false,
      }
    ],
    attributes: ['id', 'name', 'displayName'],
    order: [
      ['displayName', 'ASC'],
      [{ model: models.Submodule, as: 'Submodules' }, 'displayName', 'ASC'],
      [{ model: models.Feature, as: 'features' }, 'description', 'ASC'],
    ],
  });

  cachedMenuHierarchy = allModulesWithHierarchy;
  lastCacheTime = now;

  return cachedMenuHierarchy;
};

const clearCache = () => {
    cachedMenuHierarchy = null;
    lastCacheTime = 0;
}

module.exports = {
  getModuleHierarchy,
  clearCache,
};
