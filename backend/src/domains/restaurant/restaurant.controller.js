module.exports = (restaurantService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');

  // Helper para tratar erros de validação
  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Erro de validação', errors.array());
    }
  };

  // --- GERENCIAMENTO DO RESTAURANTE ---
  const getRestaurantById = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      res.json(restaurant);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurant = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const restaurantData = req.body;
      const updatedRestaurant = await restaurantService.updateRestaurant(restaurantId, restaurantData);
      res.json(updatedRestaurant);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantOpenStatus = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { is_open } = req.body;
      const updatedRestaurant = await restaurantService.updateRestaurantStatus(restaurantId, { is_open });
      res.json(updatedRestaurant);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantPosStatus = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { pos_status } = req.body;
      const updatedRestaurant = await restaurantService.updateRestaurantStatus(restaurantId, { pos_status });
      res.json(updatedRestaurant);
    } catch (error) {
      next(error);
    }
  };

  // --- USUÁRIOS DO RESTAURANTE ---
  const listRestaurantUsers = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const users = await restaurantService.listRestaurantUsers(restaurantId);
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  const createRestaurantUser = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newUser = await restaurantService.createRestaurantUser(restaurantId, req.body);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantUser = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, userId } = req.params;
      const updatedUser = await restaurantService.updateRestaurantUser(restaurantId, userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  const deleteRestaurantUser = async (req, res, next) => {
    try {
      const { restaurantId, userId } = req.params;
      await restaurantService.deleteRestaurantUser(restaurantId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // --- ADICIONAIS (ADDONS) ---
  const getRestaurantAddons = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const addons = await restaurantService.getRestaurantAddons(restaurantId);
      res.json(addons);
    } catch (error) {
      next(error);
    }
  };

  const createRestaurantAddon = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newAddon = await restaurantService.createRestaurantAddon(restaurantId, req.body);
      res.status(201).json(newAddon);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantAddon = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, addonId } = req.params;
      const updatedAddon = await restaurantService.updateRestaurantAddon(restaurantId, addonId, req.body);
      res.json(updatedAddon);
    } catch (error) {
      next(error);
    }
  };

  const deleteRestaurantAddon = async (req, res, next) => {
    try {
      const { restaurantId, addonId } = req.params;
      await restaurantService.deleteRestaurantAddon(restaurantId, addonId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // --- CATEGORIAS DE CAIXA ---
  const getRestaurantCashRegisterCategories = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const categories = await restaurantService.getRestaurantCashRegisterCategories(restaurantId);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };

  const createRestaurantCashRegisterCategory = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newCategory = await restaurantService.createRestaurantCashRegisterCategory(restaurantId, req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantCashRegisterCategory = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, cashRegisterCategoryId } = req.params;
      const updatedCategory = await restaurantService.updateRestaurantCashRegisterCategory(restaurantId, cashRegisterCategoryId, req.body);
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  };

  const deleteRestaurantCashRegisterCategory = async (req, res, next) => {
    try {
      const { restaurantId, cashRegisterCategoryId } = req.params;
      await restaurantService.deleteRestaurantCashRegisterCategory(restaurantId, cashRegisterCategoryId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // --- CATEGORIAS ---
  const getRestaurantCategories = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const categories = await restaurantService.getRestaurantCategories(restaurantId);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };

  const createRestaurantCategory = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newCategory = await restaurantService.createRestaurantCategory(restaurantId, req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantCategory = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, categoryId } = req.params;
      const updatedCategory = await restaurantService.updateRestaurantCategory(restaurantId, categoryId, req.body);
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  };

  const deleteRestaurantCategory = async (req, res, next) => {
    try {
      const { restaurantId, categoryId } = req.params;
      await restaurantService.deleteRestaurantCategory(restaurantId, categoryId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // --- CATEGORIAS FINANCEIRAS ---
  const getRestaurantFinancialCategories = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const categories = await restaurantService.getRestaurantFinancialCategories(restaurantId);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };

  const createRestaurantFinancialCategory = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newCategory = await restaurantService.createRestaurantFinancialCategory(restaurantId, req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantFinancialCategory = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, financialCategoryId } = req.params;
      const updatedCategory = await restaurantService.updateRestaurantFinancialCategory(restaurantId, financialCategoryId, req.body);
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  };

  const deleteRestaurantFinancialCategory = async (req, res, next) => {
    try {
      const { restaurantId, financialCategoryId } = req.params;
      await restaurantService.deleteRestaurantFinancialCategory(restaurantId, financialCategoryId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // --- INGREDIENTES ---
  const getRestaurantIngredients = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const ingredients = await restaurantService.getRestaurantIngredients(restaurantId);
      res.json(ingredients);
    } catch (error) {
      next(error);
    }
  };

  const createRestaurantIngredient = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newIngredient = await restaurantService.createRestaurantIngredient(restaurantId, req.body);
      res.status(201).json(newIngredient);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantIngredient = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, ingredientId } = req.params;
      const updatedIngredient = await restaurantService.updateRestaurantIngredient(restaurantId, ingredientId, req.body);
      res.json(updatedIngredient);
    } catch (error) {
      next(error);
    }
  };

  const deleteRestaurantIngredient = async (req, res, next) => {
    try {
      const { restaurantId, ingredientId } = req.params;
      await restaurantService.deleteRestaurantIngredient(restaurantId, ingredientId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // --- PRODUTOS ---
  const getRestaurantProducts = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const products = await restaurantService.getRestaurantProducts(restaurantId);
      res.json(products);
    } catch (error) {
      next(error);
    }
  };

  const createRestaurantProduct = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newProduct = await restaurantService.createRestaurantProduct(restaurantId, req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantProduct = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, productId } = req.params;
      const updatedProduct = await restaurantService.updateRestaurantProduct(restaurantId, productId, req.body);
      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  };

  const deleteRestaurantProduct = async (req, res, next) => {
    try {
      const { restaurantId, productId } = req.params;
      await restaurantService.deleteRestaurantProduct(restaurantId, productId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // --- FORNECEDORES ---
  const getRestaurantSuppliers = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const suppliers = await restaurantService.getRestaurantSuppliers(restaurantId);
      res.json(suppliers);
    } catch (error) {
      next(error);
    }
  };

  const createRestaurantSupplier = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newSupplier = await restaurantService.createRestaurantSupplier(restaurantId, req.body);
      res.status(201).json(newSupplier);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantSupplier = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, supplierId } = req.params;
      const updatedSupplier = await restaurantService.updateRestaurantSupplier(restaurantId, supplierId, req.body);
      res.json(updatedSupplier);
    } catch (error) {
      next(error);
    }
  };

  const deleteRestaurantSupplier = async (req, res, next) => {
    try {
      const { restaurantId, supplierId } = req.params;
      await restaurantService.deleteRestaurantSupplier(restaurantId, supplierId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // --- MESAS ---
  const getRestaurantTables = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const tables = await restaurantService.getRestaurantTables(restaurantId);
      res.json(tables);
    } catch (error) {
      next(error);
    }
  };

  const createRestaurantTable = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newTable = await restaurantService.createRestaurantTable(restaurantId, req.body);
      res.status(201).json(newTable);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantTable = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, tableId } = req.params;
      const updatedTable = await restaurantService.updateRestaurantTable(restaurantId, tableId, req.body);
      res.json(updatedTable);
    } catch (error) {
      next(error);
    }
  };

  const deleteRestaurantTable = async (req, res, next) => {
    try {
      const { restaurantId, tableId } = req.params;
      await restaurantService.deleteRestaurantTable(restaurantId, tableId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // --- FICHAS TÉCNICAS ---
  const getRestaurantTechnicalSpecifications = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const specs = await restaurantService.getRestaurantTechnicalSpecifications(restaurantId);
      res.json(specs);
    } catch (error) {
      next(error);
    }
  };

  const createRestaurantTechnicalSpecification = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newSpec = await restaurantService.createRestaurantTechnicalSpecification(restaurantId, req.body);
      res.status(201).json(newSpec);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurantTechnicalSpecification = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, technicalSpecificationId } = req.params;
      const updatedSpec = await restaurantService.updateRestaurantTechnicalSpecification(restaurantId, technicalSpecificationId, req.body);
      res.json(updatedSpec);
    } catch (error) {
      next(error);
    }
  };

  const deleteRestaurantTechnicalSpecification = async (req, res, next) => {
    try {
      const { restaurantId, technicalSpecificationId } = req.params;
      await restaurantService.deleteRestaurantTechnicalSpecification(restaurantId, technicalSpecificationId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // --- GARÇOM (WAITER/PDV) ---
  const getWaiterProducts = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const products = await restaurantService.getWaiterProducts(restaurantId);
      res.json(products);
    } catch (error) {
      next(error);
    }
  };

  const createWaiterOrder = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newOrder = await restaurantService.createWaiterOrder(restaurantId, req.body);
      res.status(201).json(newOrder);
    } catch (error) {
      next(error);
    }
  };

  const updateWaiterOrder = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, orderId } = req.params;
      const updatedOrder = await restaurantService.updateWaiterOrder(restaurantId, orderId, req.body);
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  };

  const getWaiterOrderById = async (req, res, next) => {
    try {
      const { restaurantId, orderId } = req.params;
      const order = await restaurantService.getWaiterOrderById(restaurantId, orderId);
      res.json(order);
    } catch (error) {
      next(error);
    }
  };

  const getWaiterOrders = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const orders = await restaurantService.getWaiterOrders(restaurantId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  };

  const createWaiterCall = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newCall = await restaurantService.createWaiterCall(restaurantId, req.body);
      res.status(201).json(newCall);
    } catch (error) {
      next(error);
    }
  };

  const updateWaiterCall = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { restaurantId, callId } = req.params;
      const updatedCall = await restaurantService.updateWaiterCall(restaurantId, callId, req.body);
      res.json(updatedCall);
    } catch (error) {
      next(error);
    }
  };

  const getWaiterCalls = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const calls = await restaurantService.getWaiterCalls(restaurantId);
      res.json(calls);
    } catch (error) {
      next(error);
    }
  };

  const getWaiterCallById = async (req, res, next) => {
    try {
      const { restaurantId, callId } = req.params;
      const call = await restaurantService.getWaiterCallById(restaurantId, callId);
      res.json(call);
    } catch (error) {
      next(error);
    }
  };

  const deleteWaiterCall = async (req, res, next) => {
    try {
      const { restaurantId, callId } = req.params;
      await restaurantService.deleteWaiterCall(restaurantId, callId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  return {
    getRestaurantById,
    updateRestaurant,
    updateRestaurantStatus,
    updateRestaurantPosStatus,
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