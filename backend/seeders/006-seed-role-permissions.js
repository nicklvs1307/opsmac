export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // 1. Clean up existing data
    await queryInterface.bulkDelete("role_permissions", null, { transaction });

    // 2. Get roles, features and actions
    const allRoles = await queryInterface.sequelize.query(
      'SELECT id, key FROM "roles";',
      { type: Sequelize.QueryTypes.SELECT, transaction },
    );
    const roleMap = allRoles.reduce((acc, role) => {
      acc[role.key] = role.id;
      return acc;
    }, {});

    const allFeatures = await queryInterface.sequelize.query(
      'SELECT id, key FROM "features";',
      { type: Sequelize.QueryTypes.SELECT, transaction },
    );
    const featureMap = allFeatures.reduce((acc, f) => {
      acc[f.key] = f.id;
      return acc;
    }, {});

    const actions = await queryInterface.sequelize.query(
      'SELECT id, key FROM "actions";',
      { type: Sequelize.QueryTypes.SELECT, transaction },
    );

    // 3. Seed Role Permissions
    const rolePermissions = [];

    // Super admin gets all permissions
    if (roleMap.super_admin) {
      for (const feature of allFeatures) {
        for (const action of actions) {
          rolePermissions.push({
            role_id: roleMap.super_admin,
            feature_id: feature.id,
            action_id: action.id,
            allowed: true,
            created_at: Sequelize.literal("CURRENT_TIMESTAMP"),
            updated_at: Sequelize.literal("CURRENT_TIMESTAMP"),
          });
        }
      }
    }

    // Owner permissions
    const ownerFeatures = [
      "dashboard:general:view",
      "fidelity:general:dashboard",
      "settings:general:view",
      "settings:general:profile",
      "settings:general:business",
      "settings:general:security",
      "settings:general:whatsapp",
      "settings:general:notifications",
      "settings:general:appearance",
      "fidelity:coupons:list",
      "fidelity:coupons:rewards",
    ];

    if (roleMap.owner) {
      for (const featureKey of ownerFeatures) {
        if (featureMap[featureKey]) {
          // Owners get all actions for their allowed features
          for (const action of actions) {
            rolePermissions.push({
              role_id: roleMap.owner,
              feature_id: featureMap[featureKey],
              action_id: action.id,
              allowed: true,
              created_at: Sequelize.literal("CURRENT_TIMESTAMP"),
              updated_at: Sequelize.literal("CURRENT_TIMESTAMP"),
            });
          }
        }
      }
    }

    await queryInterface.bulkInsert("role_permissions", rolePermissions, {
      transaction,
    });
  });
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkDelete("role_permissions", null, { transaction });
  });
}
