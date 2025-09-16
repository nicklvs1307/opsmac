export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Add the 'settings' column if it doesn't exist
      const tableDefinition = await queryInterface.describeTable('restaurants', { transaction });
      if (!tableDefinition.settings) {
        await queryInterface.addColumn('restaurants', 'settings', {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {},
        }, { transaction });
      }

      // 2. Update existing restaurants to ensure 'settings' and 'enabled_modules' are properly initialized
      // This will set a default empty object if settings is null, and add default modules if enabled_modules is missing
      await queryInterface.sequelize.query(`
        UPDATE "restaurants"
        SET settings = jsonb_set(
            COALESCE(settings, '{}'::jsonb),
            '{enabled_modules}',
            COALESCE(settings->'enabled_modules', '[]'::jsonb) || '["checkin_program", "survey_program"]'::jsonb,
            true
        )
        WHERE NOT (settings ? 'enabled_modules') OR (settings->'enabled_modules')::jsonb IS NULL;
      `, { transaction });
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('restaurants', 'settings', { transaction });
    });
  }