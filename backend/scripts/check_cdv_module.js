const { sequelize, ...models } = require("models");

async function checkCdvModule() {
  try {
    const cdvModule = await models.Module.findOne({ where: { name: "cdv" } });
    if (!cdvModule) {
      console.log('Module "cdv" not found.');
      return;
    }

    console.log("Module: cdv");

    const submodules = await models.Submodule.findAll({
      where: { moduleId: cdvModule.id },
    });
    if (!submodules.length) {
      console.log('  No submodules found for "cdv".');
    }

    for (const submodule of submodules) {
      console.log(
        `  Submodule: ${submodule.name} (displayName: ${submodule.displayName})`,
      );
      const features = await models.Feature.findAll({
        where: { submoduleId: submodule.id },
      });
      if (!features.length) {
        console.log(`    No features found for submodule "${submodule.name}".`);
      }
      for (const feature of features) {
        console.log(
          `    Feature: ${feature.name} (description: ${feature.description})`,
        );
      }
    }
  } catch (error) {
    console.error("Error checking cdv module:", error);
  } finally {
    // Close the database connection if needed
    sequelize.close();
  }
}

checkCdvModule();
