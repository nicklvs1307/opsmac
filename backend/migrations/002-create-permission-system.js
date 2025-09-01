'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Part 1: Catalog Tables (modules, submodules, features, actions)
    await queryInterface.createTable('modules', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      key: { type: Sequelize.TEXT, unique: true, allowNull: false },
      name: { type: Sequelize.TEXT, allowNull: false },
      description: { type: Sequelize.TEXT },
      visible: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('submodules', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      module_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'modules', key: 'id' }, onDelete: 'CASCADE' },
      key: { type: Sequelize.TEXT, allowNull: false },
      name: { type: Sequelize.TEXT, allowNull: false },
      description: { type: Sequelize.TEXT },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });
    await queryInterface.addConstraint('submodules', { fields: ['module_id', 'key'], type: 'unique', name: 'submodule_module_key_unique' });

    await queryInterface.createTable('features', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      submodule_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'submodules', key: 'id' }, onDelete: 'CASCADE' },
      key: { type: Sequelize.TEXT, allowNull: false },
      name: { type: Sequelize.TEXT, allowNull: false },
      description: { type: Sequelize.TEXT },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      flags: { type: Sequelize.JSONB, defaultValue: {} },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });
    await queryInterface.addConstraint('features', { fields: ['submodule_id', 'key'], type: 'unique', name: 'feature_submodule_key_unique' });

    await queryInterface.createTable('actions', {
      id: { type: Sequelize.SMALLINT, primaryKey: true, autoIncrement: true },
      key: { type: Sequelize.TEXT, unique: true, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });

    // Part 2: Entitlement and RBAC Tables (adapted for Restaurants as Tenants)
    await queryInterface.sequelize.query("CREATE TYPE entitlement_status AS ENUM ('active','locked','hidden','trial');");
    await queryInterface.sequelize.query("CREATE TYPE entitlement_entity AS ENUM ('module','submodule','feature');");

    await queryInterface.createTable('restaurant_entitlements', {
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      entity_type: { type: 'entitlement_entity', allowNull: false },
      entity_id: { type: Sequelize.UUID, allowNull: false },
      status: { type: 'entitlement_status', allowNull: false },
      source: { type: Sequelize.TEXT, allowNull: false },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });
    await queryInterface.addConstraint('restaurant_entitlements', { fields: ['restaurant_id', 'entity_type', 'entity_id'], type: 'primary key', name: 'restaurant_entitlement_pk' });

    await queryInterface.createTable('roles', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      restaurant_id: { type: Sequelize.UUID, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      key: { type: Sequelize.TEXT, allowNull: false },
      name: { type: Sequelize.TEXT, allowNull: false },
      is_system: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });
    await queryInterface.addConstraint('roles', { fields: ['restaurant_id', 'key'], type: 'unique', name: 'role_restaurant_key_unique' });

    await queryInterface.createTable('role_permissions', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      role_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE' },
      feature_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'features', key: 'id' }, onDelete: 'CASCADE' },
      action_id: { type: Sequelize.SMALLINT, allowNull: false, references: { model: 'actions', key: 'id' } },
      allowed: { type: Sequelize.BOOLEAN, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });
    await queryInterface.addConstraint('role_permissions', { fields: ['role_id', 'feature_id', 'action_id'], type: 'unique', name: 'role_permission_unique' });

    await queryInterface.createTable('user_roles', {
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      role_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });
    await queryInterface.addConstraint('user_roles', { fields: ['user_id', 'restaurant_id', 'role_id'], type: 'primary key', name: 'user_role_pk' });

    await queryInterface.createTable('user_permission_overrides', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      feature_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'features', key: 'id' }, onDelete: 'CASCADE' },
      action_id: { type: Sequelize.SMALLINT, allowNull: false, references: { model: 'actions', key: 'id' } },
      allowed: { type: Sequelize.BOOLEAN, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });
    await queryInterface.addConstraint('user_permission_overrides', { fields: ['user_id', 'restaurant_id', 'feature_id', 'action_id'], type: 'unique', name: 'user_permission_override_unique' });

    // Part 3: Audit Log Table
    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      actor_user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      restaurant_id: { type: Sequelize.UUID, references: { model: 'restaurants', key: 'id' } },
      action: { type: Sequelize.TEXT, allowNull: false },
      resource: { type: Sequelize.TEXT },
      payload: { type: Sequelize.JSONB },
    });

    // Part 4: Indexes for Performance
    await queryInterface.addIndex('restaurant_entitlements', ['restaurant_id'], { name: 'idx_restaurant_entitlements_restaurant' });
    await queryInterface.addIndex('role_permissions', ['role_id'], { name: 'idx_role_permissions_role' });
    await queryInterface.addIndex('user_roles', ['user_id'], { name: 'idx_user_roles_user' });
    await queryInterface.addIndex('user_permission_overrides', ['user_id'], { name: 'idx_user_overrides_user' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('user_permission_overrides');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('restaurant_entitlements');
    await queryInterface.dropTable('actions');
    await queryInterface.dropTable('features');
    await queryInterface.dropTable('submodules');
    await queryInterface.dropTable('modules');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS entitlement_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS entitlement_entity;');
  }
};
