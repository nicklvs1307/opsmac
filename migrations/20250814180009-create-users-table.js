module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('users');
    if (!tableExists) {
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        role: {
          type: Sequelize.ENUM('admin', 'owner', 'manager', 'super_admin'),
          defaultValue: 'owner',
          allowNull: false
        },
        avatar: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        email_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        email_verification_token: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        password_reset_token: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        password_reset_expires: {
          type: Sequelize.DATE,
          allowNull: true
        },
        last_login: {
          type: Sequelize.DATE,
          allowNull: true
        },
        login_attempts: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        locked_until: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};