export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('rewards', 'title', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('rewards', 'value', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('rewards', 'valid_from', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('rewards', 'valid_until', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('rewards', 'total_uses_limit', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('rewards', 'current_uses', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('rewards', 'max_uses_per_customer', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('rewards', 'trigger_conditions', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('rewards', 'wheel_config', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('rewards', 'analytics', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    });
    await queryInterface.addColumn('rewards', 'coupon_validity_days', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('rewards', 'days_valid', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('rewards', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('rewards', 'created_by');
    await queryInterface.removeColumn('rewards', 'days_valid');
    await queryInterface.removeColumn('rewards', 'coupon_validity_days');
    await queryInterface.removeColumn('rewards', 'analytics');
    await queryInterface.removeColumn('rewards', 'wheel_config');
    await queryInterface.removeColumn('rewards', 'trigger_conditions');
    await queryInterface.removeColumn('rewards', 'max_uses_per_customer');
    await queryInterface.removeColumn('rewards', 'current_uses');
    await queryInterface.removeColumn('rewards', 'total_uses_limit');
    await queryInterface.removeColumn('rewards', 'valid_until');
    await queryInterface.removeColumn('rewards', 'valid_from');
    await queryInterface.removeColumn('rewards', 'value');
    await queryInterface.removeColumn('rewards', 'title');
  }