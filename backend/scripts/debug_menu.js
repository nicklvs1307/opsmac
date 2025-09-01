const db = require('../models');

async function debugMenu() {
  try {
    const allModulesWithHierarchy = await db.Module.findAll({
      include: [
        {
          model: db.Submodule,
          as: 'Submodules',
          include: [{
            model: db.Feature,
            as: 'features',
            attributes: ['id', 'name', 'description'],
          }],
          attributes: ['id', 'name', 'description', 'displayName'],
        },
        {
          model: db.Feature,
          as: 'features', // Features directly under module
          attributes: ['id', 'name', 'description'],
          where: { submoduleId: null }, // Only features not linked to a submodule
          required: false,
        }
      ],
      attributes: ['id', 'name', 'displayName'],
      order: [
        ['displayName', 'ASC'],
        [{ model: db.Submodule, as: 'Submodules' }, 'displayName', 'ASC'],
        [{ model: db.Feature, as: 'features' }, 'description', 'ASC'],
      ],
    });

    console.log(JSON.stringify(allModulesWithHierarchy, null, 2));

  } catch (error) {
    console.error('Error debugging menu:', error);
  } finally {
    db.sequelize.close();
  }
}

debugMenu();