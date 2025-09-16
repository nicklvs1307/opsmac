export async function up(queryInterface, Sequelize) {
    // Main entities: Suppliers, Ingredients, Products
    await queryInterface.createTable('suppliers', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      name: { type: Sequelize.STRING, allowNull: false },
      contact_person: { type: Sequelize.STRING },
      phone: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING },
      address: { type: Sequelize.TEXT },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('ingredients', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      name: { type: Sequelize.STRING, allowNull: false },
      unit: { type: Sequelize.STRING, allowNull: false }, // e.g., kg, liter, unit
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      supplier_id: { type: Sequelize.UUID, references: { model: 'suppliers', key: 'id' }, onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('products', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      category_id: { type: Sequelize.UUID, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' }, // Assumes categories table exists
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      min_stock_level: { type: Sequelize.DECIMAL(10, 3) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      addons: { type: Sequelize.JSONB, defaultValue: [] },
      variations: { type: Sequelize.JSONB, defaultValue: [] },
    });

    // Polymorphic Stock Table
    await queryInterface.createTable('stocks', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      quantity: { type: Sequelize.DECIMAL(10, 3), allowNull: false, defaultValue: 0 },
      stockable_id: { type: Sequelize.UUID, allowNull: false },
      stockable_type: { type: Sequelize.STRING, allowNull: false }, // 'product' or 'ingredient'
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      label_format: { type: Sequelize.STRING },
      label_fields: { type: Sequelize.JSONB },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('stocks', ['stockable_id', 'stockable_type', 'restaurant_id'], { unique: true, name: 'idx_stock_uniqueness' });

    // Stock-related tables
    await queryInterface.createTable('stock_movements', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      stock_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'stocks', key: 'id' }, onDelete: 'CASCADE' },
      quantity_change: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
      reason: { type: Sequelize.STRING, allowNull: false }, // e.g., 'initial', 'sale', 'loss', 'correction'
      notes: { type: Sequelize.TEXT },
      user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('technical_specifications', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      product_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE', unique: true },
      content: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('recipe_ingredients', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      product_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
      ingredient_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'ingredients', key: 'id' }, onDelete: 'CASCADE' },
      quantity: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('printed_labels', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
        stockable_id: { type: Sequelize.UUID, allowNull: false },
        stockable_type: { type: Sequelize.STRING, allowNull: false },
        print_date: { type: Sequelize.DATE, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false },
        user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('loss_records', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
        stockable_id: { type: Sequelize.UUID, allowNull: false },
        stockable_type: { type: Sequelize.STRING, allowNull: false },
        quantity: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
        reason: { type: Sequelize.STRING, allowNull: false },
        user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('stock_counts', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
        reference_date: { type: Sequelize.DATE, allowNull: false },
        status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' }, // pending, completed
        user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('stock_count_items', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
        stock_count_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'stock_counts', key: 'id' }, onDelete: 'CASCADE' },
        stockable_id: { type: Sequelize.UUID, allowNull: false },
        stockable_type: { type: Sequelize.STRING, allowNull: false },
        counted_quantity: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
        system_quantity: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('production_records', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
        user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('production_record_items', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
        production_record_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'production_records', key: 'id' }, onDelete: 'CASCADE' },
        product_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'products', key: 'id' } },
        quantity_produced: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('production_record_items');
    await queryInterface.dropTable('production_records');
    await queryInterface.dropTable('stock_count_items');
    await queryInterface.dropTable('stock_counts');
    await queryInterface.dropTable('loss_records');
    await queryInterface.dropTable('printed_labels');
    await queryInterface.dropTable('recipe_ingredients');
    await queryInterface.dropTable('technical_specifications');
    await queryInterface.dropTable('stock_movements');
    await queryInterface.dropTable('stocks');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('ingredients');
    await queryInterface.dropTable('suppliers');
  }
