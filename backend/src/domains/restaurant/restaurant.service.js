module.exports = (db) => {
  const { models } = db;
  const { Op } = require("sequelize");
  const { BadRequestError, NotFoundError } = require("utils/errors");

  // --- GERENCIAMENTO DO RESTAURANTE ---
  const getRestaurantById = async (restaurantId) => {
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }
    return restaurant;
  };

  const updateRestaurant = async (restaurantId, restaurantData) => {
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }
    await restaurant.update(restaurantData);
    return restaurant;
  };

  const updateRestaurantStatus = async (restaurantId, statusData) => {
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }
    await restaurant.update(statusData);
    return restaurant;
  };

  // --- USUÁRIOS DO RESTAURANTE ---
  const listRestaurantUsers = async (restaurantId) => {
    const users = await models.User.findAll({
      where: { restaurant_id: restaurantId },
      include: [{ model: models.Role, as: "roles" }],
    });
    return users;
  };

  const createRestaurantUser = async (restaurantId, userData) => {
    const user = await models.User.create({
      ...userData,
      restaurant_id: restaurantId,
    });
    return user;
  };

  const updateRestaurantUser = async (restaurantId, userId, userData) => {
    const user = await models.User.findOne({
      where: { id: userId, restaurant_id: restaurantId },
    });
    if (!user) {
      throw new NotFoundError(
        "Usuário não encontrado ou não pertence a este restaurante.",
      );
    }
    await user.update(userData);
    return user;
  };

  const deleteRestaurantUser = async (restaurantId, userId) => {
    const user = await models.User.findOne({
      where: { id: userId, restaurant_id: restaurantId },
    });
    if (!user) {
      throw new NotFoundError(
        "Usuário não encontrado ou não pertence a este restaurante.",
      );
    }
    await user.destroy();
  };

  // --- ADICIONAIS (ADDONS) ---
  const getRestaurantAddons = async (restaurantId) => {
    const addons = await models.Addon.findAll({
      where: { restaurant_id: restaurantId },
    });
    return addons;
  };

  const createRestaurantAddon = async (restaurantId, addonData) => {
    const addon = await models.Addon.create({
      ...addonData,
      restaurant_id: restaurantId,
    });
    return addon;
  };

  const updateRestaurantAddon = async (restaurantId, addonId, addonData) => {
    const addon = await models.Addon.findOne({
      where: { id: addonId, restaurant_id: restaurantId },
    });
    if (!addon) {
      throw new NotFoundError(
        "Adicional não encontrado ou não pertence a este restaurante.",
      );
    }
    await addon.update(addonData);
    return addon;
  };

  const deleteRestaurantAddon = async (restaurantId, addonId) => {
    const addon = await models.Addon.findOne({
      where: { id: addonId, restaurant_id: restaurantId },
    });
    if (!addon) {
      throw new NotFoundError(
        "Adicional não encontrado ou não pertence a este restaurante.",
      );
    }
    await addon.destroy();
  };

  // --- CATEGORIAS DE CAIXA ---
  const getRestaurantCashRegisterCategories = async (restaurantId) => {
    const categories = await models.CashRegisterCategory.findAll({
      where: { restaurant_id: restaurantId },
    });
    return categories;
  };

  const createRestaurantCashRegisterCategory = async (
    restaurantId,
    categoryData,
  ) => {
    const category = await models.CashRegisterCategory.create({
      ...categoryData,
      restaurant_id: restaurantId,
    });
    return category;
  };

  const updateRestaurantCashRegisterCategory = async (
    restaurantId,
    cashRegisterCategoryId,
    categoryData,
  ) => {
    const category = await models.CashRegisterCategory.findOne({
      where: { id: cashRegisterCategoryId, restaurant_id: restaurantId },
    });
    if (!category) {
      throw new NotFoundError(
        "Categoria de caixa não encontrada ou não pertence a este restaurante.",
      );
    }
    await category.update(categoryData);
    return category;
  };

  const deleteRestaurantCashRegisterCategory = async (
    restaurantId,
    cashRegisterCategoryId,
  ) => {
    const category = await models.CashRegisterCategory.findOne({
      where: { id: cashRegisterCategoryId, restaurant_id: restaurantId },
    });
    if (!category) {
      throw new NotFoundError(
        "Categoria de caixa não encontrada ou não pertence a este restaurante.",
      );
    }
    await category.destroy();
  };

  // --- CATEGORIAS ---
  const getRestaurantCategories = async (restaurantId) => {
    const categories = await models.Category.findAll({
      where: { restaurant_id: restaurantId },
    });
    return categories;
  };

  const createRestaurantCategory = async (restaurantId, categoryData) => {
    const category = await models.Category.create({
      ...categoryData,
      restaurant_id: restaurantId,
    });
    return category;
  };

  const updateRestaurantCategory = async (
    restaurantId,
    categoryId,
    categoryData,
  ) => {
    const category = await models.Category.findOne({
      where: { id: categoryId, restaurant_id: restaurantId },
    });
    if (!category) {
      throw new NotFoundError(
        "Categoria não encontrada ou não pertence a este restaurante.",
      );
    }
    await category.update(categoryData);
    return category;
  };

  const deleteRestaurantCategory = async (restaurantId, categoryId) => {
    const category = await models.Category.findOne({
      where: { id: categoryId, restaurant_id: restaurantId },
    });
    if (!category) {
      throw new NotFoundError(
        "Categoria não encontrada ou não pertence a este restaurante.",
      );
    }
    await category.destroy();
  };

  // --- CATEGORIAS FINANCEIRAS ---
  const getRestaurantFinancialCategories = async (restaurantId) => {
    const categories = await models.FinancialCategory.findAll({
      where: { restaurant_id: restaurantId },
    });
    return categories;
  };

  const createRestaurantFinancialCategory = async (
    restaurantId,
    categoryData,
  ) => {
    const category = await models.FinancialCategory.create({
      ...categoryData,
      restaurant_id: restaurantId,
    });
    return category;
  };

  const updateRestaurantFinancialCategory = async (
    restaurantId,
    financialCategoryId,
    categoryData,
  ) => {
    const category = await models.FinancialCategory.findOne({
      where: { id: financialCategoryId, restaurant_id: restaurantId },
    });
    if (!category) {
      throw new NotFoundError(
        "Categoria financeira não encontrada ou não pertence a este restaurante.",
      );
    }
    await category.update(categoryData);
    return category;
  };

  const deleteRestaurantFinancialCategory = async (
    restaurantId,
    financialCategoryId,
  ) => {
    const category = await models.FinancialCategory.findOne({
      where: { id: financialCategoryId, restaurant_id: restaurantId },
    });
    if (!category) {
      throw new NotFoundError(
        "Categoria financeira não encontrada ou não pertence a este restaurante.",
      );
    }
    await category.destroy();
  };

  // --- INGREDIENTES ---
  const getRestaurantIngredients = async (restaurantId) => {
    const ingredients = await models.Ingredient.findAll({
      where: { restaurant_id: restaurantId },
    });
    return ingredients;
  };

  const createRestaurantIngredient = async (restaurantId, ingredientData) => {
    const ingredient = await models.Ingredient.create({
      ...ingredientData,
      restaurant_id: restaurantId,
    });
    return ingredient;
  };

  const updateRestaurantIngredient = async (
    restaurantId,
    ingredientId,
    ingredientData,
  ) => {
    const ingredient = await models.Ingredient.findOne({
      where: { id: ingredientId, restaurant_id: restaurantId },
    });
    if (!ingredient) {
      throw new NotFoundError(
        "Ingrediente não encontrado ou não pertence a este restaurante.",
      );
    }
    await ingredient.update(ingredientData);
    return ingredient;
  };

  const deleteRestaurantIngredient = async (restaurantId, ingredientId) => {
    const ingredient = await models.Ingredient.findOne({
      where: { id: ingredientId, restaurant_id: restaurantId },
    });
    if (!ingredient) {
      throw new NotFoundError(
        "Ingrediente não encontrado ou não pertence a este restaurante.",
      );
    }
    await ingredient.destroy();
  };

  // --- PRODUTOS ---
  const getRestaurantProducts = async (restaurantId) => {
    const products = await models.Product.findAll({
      where: { restaurant_id: restaurantId },
    });
    return products;
  };

  const createRestaurantProduct = async (restaurantId, productData) => {
    const product = await models.Product.create({
      ...productData,
      restaurant_id: restaurantId,
    });
    return product;
  };

  const updateRestaurantProduct = async (
    restaurantId,
    productId,
    productData,
  ) => {
    const product = await models.Product.findOne({
      where: { id: productId, restaurant_id: restaurantId },
    });
    if (!product) {
      throw new NotFoundError(
        "Produto não encontrado ou não pertence a este restaurante.",
      );
    }
    await product.update(productData);
    return product;
  };

  const deleteRestaurantProduct = async (restaurantId, productId) => {
    const product = await models.Product.findOne({
      where: { id: productId, restaurant_id: restaurantId },
    });
    if (!product) {
      throw new NotFoundError(
        "Produto não encontrado ou não pertence a este restaurante.",
      );
    }
    await product.destroy();
  };

  // --- FORNECEDORES ---
  const getRestaurantSuppliers = async (restaurantId) => {
    const suppliers = await models.Supplier.findAll({
      where: { restaurant_id: restaurantId },
    });
    return suppliers;
  };

  const createRestaurantSupplier = async (restaurantId, supplierData) => {
    const supplier = await models.Supplier.create({
      ...supplierData,
      restaurant_id: restaurantId,
    });
    return supplier;
  };

  const updateRestaurantSupplier = async (
    restaurantId,
    supplierId,
    supplierData,
  ) => {
    const supplier = await models.Supplier.findOne({
      where: { id: supplierId, restaurant_id: restaurantId },
    });
    if (!supplier) {
      throw new NotFoundError(
        "Fornecedor não encontrado ou não pertence a este restaurante.",
      );
    }
    await supplier.update(supplierData);
    return supplier;
  };

  const deleteRestaurantSupplier = async (restaurantId, supplierId) => {
    const supplier = await models.Supplier.findOne({
      where: { id: supplierId, restaurant_id: restaurantId },
    });
    if (!supplier) {
      throw new NotFoundError(
        "Fornecedor não encontrado ou não pertence a este restaurante.",
      );
    }
    await supplier.destroy();
  };

  // --- MESAS ---
  const getRestaurantTables = async (restaurantId) => {
    const tables = await models.Table.findAll({
      where: { restaurant_id: restaurantId },
    });
    return tables;
  };

  const createRestaurantTable = async (restaurantId, tableData) => {
    const table = await models.Table.create({
      ...tableData,
      restaurant_id: restaurantId,
    });
    return table;
  };

  const updateRestaurantTable = async (restaurantId, tableId, tableData) => {
    const table = await models.Table.findOne({
      where: { id: tableId, restaurant_id: restaurantId },
    });
    if (!table) {
      throw new NotFoundError(
        "Mesa não encontrada ou não pertence a este restaurante.",
      );
    }
    await table.update(tableData);
    return table;
  };

  const deleteRestaurantTable = async (restaurantId, tableId) => {
    const table = await models.Table.findOne({
      where: { id: tableId, restaurant_id: restaurantId },
    });
    if (!table) {
      throw new NotFoundError(
        "Mesa não encontrada ou não pertence a este restaurante.",
      );
    }
    await table.destroy();
  };

  // --- FICHAS TÉCNICAS ---
  const getRestaurantTechnicalSpecifications = async (restaurantId) => {
    const specs = await models.TechnicalSpecification.findAll({
      where: { restaurant_id: restaurantId },
    });
    return specs;
  };

  const createRestaurantTechnicalSpecification = async (
    restaurantId,
    specData,
  ) => {
    const spec = await models.TechnicalSpecification.create({
      ...specData,
      restaurant_id: restaurantId,
    });
    return spec;
  };

  const updateRestaurantTechnicalSpecification = async (
    restaurantId,
    technicalSpecificationId,
    specData,
  ) => {
    const spec = await models.TechnicalSpecification.findOne({
      where: { id: technicalSpecificationId, restaurant_id: restaurantId },
    });
    if (!spec) {
      throw new NotFoundError(
        "Ficha técnica não encontrada ou não pertence a este restaurante.",
      );
    }
    await spec.update(specData);
    return spec;
  };

  const deleteRestaurantTechnicalSpecification = async (
    restaurantId,
    technicalSpecificationId,
  ) => {
    const spec = await models.TechnicalSpecification.findOne({
      where: { id: technicalSpecificationId, restaurant_id: restaurantId },
    });
    if (!spec) {
      throw new NotFoundError(
        "Ficha técnica não encontrada ou não pertence a este restaurante.",
      );
    }
    await spec.destroy();
  };

  // --- GARÇOM (WAITER/PDV) ---
  const getWaiterProducts = async (restaurantId) => {
    const products = await models.Product.findAll({
      where: { restaurant_id: restaurantId },
    });
    return products;
  };

  const createWaiterOrder = async (restaurantId, orderData) => {
    const order = await models.Order.create({
      ...orderData,
      restaurant_id: restaurantId,
    });
    return order;
  };

  const updateWaiterOrder = async (restaurantId, orderId, orderData) => {
    const order = await models.Order.findOne({
      where: { id: orderId, restaurant_id: restaurantId },
    });
    if (!order) {
      throw new NotFoundError(
        "Pedido não encontrado ou não pertence a este restaurante.",
      );
    }
    await order.update(orderData);
    return order;
  };

  const getWaiterOrderById = async (restaurantId, orderId) => {
    const order = await models.Order.findOne({
      where: { id: orderId, restaurant_id: restaurantId },
    });
    if (!order) {
      throw new NotFoundError(
        "Pedido não encontrado ou não pertence a este restaurante.",
      );
    }
    return order;
  };

  const getWaiterOrders = async (restaurantId) => {
    const orders = await models.Order.findAll({
      where: { restaurant_id: restaurantId },
    });
    return orders;
  };

  const createWaiterCall = async (restaurantId, callData) => {
    const call = await models.WaiterCall.create({
      ...callData,
      restaurant_id: restaurantId,
    });
    return call;
  };

  const updateWaiterCall = async (restaurantId, callId, callData) => {
    const call = await models.WaiterCall.findOne({
      where: { id: callId, restaurant_id: restaurantId },
    });
    if (!call) {
      throw new NotFoundError(
        "Chamada não encontrada ou não pertence a este restaurante.",
      );
    }
    await call.update(callData);
    return call;
  };

  const getWaiterCalls = async (restaurantId) => {
    const calls = await models.WaiterCall.findAll({
      where: { restaurant_id: restaurantId },
    });
    return calls;
  };

  const getWaiterCallById = async (restaurantId, callId) => {
    const call = await models.WaiterCall.findOne({
      where: { id: callId, restaurant_id: restaurantId },
    });
    if (!call) {
      throw new NotFoundError(
        "Chamada não encontrada ou não pertence a este restaurante.",
      );
    }
    return call;
  };

  const deleteWaiterCall = async (restaurantId, callId) => {
    const call = await models.WaiterCall.findOne({
      where: { id: callId, restaurant_id: restaurantId },
    });
    if (!call) {
      throw new NotFoundError(
        "Chamada não encontrada ou não pertence a este restaurante.",
      );
    }
    await call.destroy();
  };

  return {
    getRestaurantById,
    updateRestaurant,
    updateRestaurantStatus,
    listRestaurantUsers,
    createRestaurantUser,
    updateRestaurantUser,
    deleteRestaurantUser,
    getRestaurantAddons,
    createRestaurantAddon,
    updateRestaurantAddon,
    deleteRestaurantAddon,
    getRestaurantCashRegisterCategories,
    createRestaurantCashRegisterCategory,
    updateRestaurantCashRegisterCategory,
    deleteRestaurantCashRegisterCategory,
    getRestaurantCategories,
    createRestaurantCategory,
    updateRestaurantCategory,
    deleteRestaurantCategory,
    getRestaurantFinancialCategories,
    createRestaurantFinancialCategory,
    updateRestaurantFinancialCategory,
    deleteRestaurantFinancialCategory,
    getRestaurantIngredients,
    createRestaurantIngredient,
    updateRestaurantIngredient,
    deleteRestaurantIngredient,
    getRestaurantProducts,
    createRestaurantProduct,
    updateRestaurantProduct,
    deleteRestaurantProduct,
    getRestaurantSuppliers,
    createRestaurantSupplier,
    updateRestaurantSupplier,
    deleteRestaurantSupplier,
    getRestaurantTables,
    createRestaurantTable,
    updateRestaurantTable,
    deleteRestaurantTable,
    getRestaurantTechnicalSpecifications,
    createRestaurantTechnicalSpecification,
    updateRestaurantTechnicalSpecification,
    deleteRestaurantTechnicalSpecification,
    getWaiterProducts,
    createWaiterOrder,
    updateWaiterOrder,
    getWaiterOrderById,
    getWaiterOrders,
    createWaiterCall,
    updateWaiterCall,
    getWaiterCalls,
    getWaiterCallById,
    deleteWaiterCall,
  };
};
