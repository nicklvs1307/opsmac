export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('rewards', 'customer_id', {
      type: Sequelize.UUID,
      allowNull: true, // Pode ser null se a recompensa não for específica de um cliente
      references: {
        model: 'customers', // Nome da tabela de clientes
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('rewards', 'restaurant_id', {
      type: Sequelize.UUID,
      allowNull: false, // restaurant_id geralmente não pode ser null
      references: {
        model: 'restaurants', // Nome da tabela de restaurantes
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('rewards', 'restaurant_id');
    await queryInterface.removeColumn('rewards', 'customer_id');
  }