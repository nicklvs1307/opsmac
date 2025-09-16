import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // --- Get Super Admin Role ---
      const roles = await queryInterface.sequelize.query(
        "SELECT id FROM \"roles\" WHERE key = 'super_admin';",
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction },
      );

      if (!roles || roles.length === 0) {
        throw new Error(
          "A função super_admin não foi encontrada. Rode o seeder de permissões primeiro.",
        );
      }
      const superAdminRoleId = roles[0].id;

      // --- Seed Super Admin User ---
      const superAdminId = uuidv4();
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash("superadmin@123", salt);

      await queryInterface.bulkInsert(
        "users",
        [
          {
            id: superAdminId,
            email: "superadmin@example.com",
            name: "Super Admin",
            password_hash: hashedPassword,
            is_superadmin: true,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { transaction },
      );

      // --- Seed Default Restaurant (Tenant) ---
      const restaurantId = uuidv4();
      await queryInterface.bulkInsert(
        "restaurants",
        [
          {
            id: restaurantId,
            name: "Restaurante Padrão",
            slug: "restaurante-padrao",
            address: "Rua Padrão, 123",
            city: "Cidade Padrão",
            state: "SP",
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { transaction },
      );

      // --- Link Super Admin to Default Restaurant as Owner ---
      await queryInterface.bulkInsert(
        "user_restaurants",
        [
          {
            user_id: superAdminId,
            restaurant_id: restaurantId,
            is_owner: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { transaction },
      );

      // --- Link User to Role ---
      await queryInterface.bulkInsert(
        "user_roles",
        [
          {
            user_id: superAdminId,
            role_id: superAdminRoleId,
            restaurant_id: restaurantId, // Assuming superadmin is linked to the default restaurant
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { transaction },
      );
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("user_roles", null, { transaction });
      await queryInterface.bulkDelete("user_restaurants", null, { transaction });
      await queryInterface.bulkDelete("restaurants", null, { transaction });
      await queryInterface.bulkDelete(
        "users",
        { email: "superadmin@example.com" },
        { transaction },
      );
    });
  }