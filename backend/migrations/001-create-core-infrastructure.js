export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Enable pgcrypto extension for UUID generation
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;', { transaction });

      // 1. Create consolidated 'users' table
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        email: {
          type: Sequelize.TEXT,
          unique: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        password_hash: {
          type: Sequelize.TEXT,
        },
        is_superadmin: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      }, { transaction });

    // 2. Create consolidated 'restaurants' table (the "tenant")
      await queryInterface.createTable('restaurants', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.literal('gen_random_uuid()')
        },
        name: {
          type: Sequelize.STRING(150),
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING(150),
          unique: true
        },
        description: {
          type: Sequelize.TEXT
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        city: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        state: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        zipCode: {
          type: Sequelize.STRING(20)
        },
        phone: {
          type: Sequelize.STRING(20)
        },
        email: {
          type: Sequelize.STRING(150)
        },
        website: {
          type: Sequelize.STRING(255)
        },
        logo: {
          type: Sequelize.STRING(500)
        },
        // --- Columns from permission system spec ---
        plan_key: {
          type: Sequelize.TEXT,
        },
        status: {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: 'active',
        },
        perm_version: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: 1,
        },
        // --- End of permission system columns ---
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
      }, { transaction });

    // 3. Create 'user_restaurants' join table
      await queryInterface.createTable('user_restaurants', {
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        restaurant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'restaurants', key: 'id' },
          onDelete: 'CASCADE',
        },
        is_owner: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      }, { transaction });
      await queryInterface.addConstraint('user_restaurants', {
        fields: ['user_id', 'restaurant_id'],
        type: 'primary key',
        name: 'user_restaurant_pk'
      }, { transaction });
      
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('user_restaurants', { transaction });
      await queryInterface.dropTable('restaurants', { transaction });
      await queryInterface.dropTable('users', { transaction });
    });
  }
