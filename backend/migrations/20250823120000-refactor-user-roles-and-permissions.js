
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Adicionar a coluna restaurantId em Roles para escopo por restaurante
      await queryInterface.addColumn('Roles', 'restaurantId', {
        type: Sequelize.UUID,
        allowNull: true, // Nulo para roles globais como Super Admin
        references: {
          model: 'restaurants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Se o restaurante for deletado, suas roles também serão
      }, { transaction });

      // 2. Adicionar a coluna moduleId em Permissions para vincular a módulos
      await queryInterface.addColumn('Permissions', 'moduleId', {
        type: Sequelize.INTEGER,
        allowNull: true, // Nulo para permissões não atreladas a módulos
        references: {
          model: 'modules',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }, { transaction });

      // 3. Adicionar a coluna roleId em Users
      await queryInterface.addColumn('users', 'roleId', {
        type: Sequelize.INTEGER,
        allowNull: true, // Temporariamente nulo para podermos popular
        references: {
          model: 'Roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Se a role for deletada, o usuário fica sem role, mas não é deletado
      }, { transaction });

      // --- DATA MIGRATION ---
      // Mapeia os nomes das roles antigas para os IDs das novas roles (assumindo que o seeder já rodou)
      // NOTA: Este passo assume que os nomes 'super_admin', 'owner', 'manager', 'waiter' existem na tabela Roles
      await queryInterface.sequelize.query(`
        UPDATE users
        SET "roleId" = (SELECT id FROM "Roles" WHERE name = users.role::text AND "restaurantId" IS NULL LIMIT 1)
        WHERE users.role::text IN ('super_admin', 'admin');
      `, { transaction });
      
      await queryInterface.sequelize.query(`
        UPDATE users u
        SET "roleId" = (
            SELECT r.id FROM "Roles" r
            WHERE r.name = u.role::text
              AND r."restaurantId" = u."restaurantId"
            LIMIT 1
        )
        WHERE u.role::text IN ('owner', 'manager', 'waiter') AND u."restaurantId" IS NOT NULL;
      `, { transaction });


      // 4. Tornar a coluna roleId não-nula após a migração dos dados
      await queryInterface.changeColumn('users', 'roleId', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction });

      // 5. Remover a coluna antiga 'role'
      await queryInterface.removeColumn('users', 'role', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Adicionar a coluna 'role' de volta
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.ENUM('admin', 'owner', 'manager', 'super_admin', 'waiter'),
        defaultValue: 'owner',
        allowNull: false,
      }, { transaction });

      // --- DATA ROLLBACK ---
      // Popula a coluna 'role' com base no 'roleId'
      await queryInterface.sequelize.query(`
        UPDATE users
        SET role = (SELECT name FROM "Roles" WHERE id = users."roleId")
        WHERE "roleId" IS NOT NULL;
      `, { transaction });

      // 2. Remover a coluna 'roleId'
      await queryInterface.removeColumn('users', 'roleId', { transaction });

      // 3. Remover a coluna 'moduleId' de Permissions
      await queryInterface.removeColumn('Permissions', 'moduleId', { transaction });

      // 4. Remover a coluna 'restaurantId' de Roles
      await queryInterface.removeColumn('Roles', 'restaurantId', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
