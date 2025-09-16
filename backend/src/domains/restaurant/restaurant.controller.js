import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors/index.js";
import auditService from "../../services/auditService";

export default (restaurantService) => {
  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Erro de validação", errors.array());
    }
  };

  const getRestaurantById = async (req, res, next) => {
    const restaurantId = req.params.restaurantId || req.context.restaurantId;
    const restaurant = await restaurantService.getRestaurantById(restaurantId);
    res.json(restaurant);
  };

  const listRestaurants = async (req, res, next) => {
    try {
      const { ids } = req.query;
      let restaurantIds = [];
      if (ids) {
        restaurantIds = ids.split(",");
      }
      const restaurants =
        await restaurantService.listRestaurants(restaurantIds);
      res.json(restaurants);
    } catch (error) {
      next(error);
    }
  };

  const updateRestaurant = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const restaurantData = req.body;
    const updatedRestaurant = await restaurantService.updateRestaurant(
      restaurantId,
      restaurantData,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_UPDATED",
      `Restaurant:${restaurantId}`,
      { updatedData: restaurantData },
    );
    res.json(updatedRestaurant);
  };

  const updateRestaurantOpenStatus = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const { is_open } = req.body;
    const updatedRestaurant = await restaurantService.updateRestaurantStatus(
      restaurantId,
      { is_open },
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_OPEN_STATUS_UPDATED",
      `Restaurant:${restaurantId}`,
      { is_open },
    );
    res.json(updatedRestaurant);
  };

  const updateRestaurantPosStatus = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const { pos_status } = req.body;
    const updatedRestaurant = await restaurantService.updateRestaurantStatus(
      restaurantId,
      { pos_status },
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_POS_STATUS_UPDATED",
      `Restaurant:${restaurantId}`,
      { pos_status },
    );
    res.json(updatedRestaurant);
  };

  const listRestaurantUsers = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const users = await restaurantService.listRestaurantUsers(restaurantId);
    res.json(users);
  };

  const createRestaurantUser = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newUser = await restaurantService.createRestaurantUser(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_USER_CREATED",
      `User:${newUser.id}`,
      { email: newUser.email },
    );
    res.status(201).json(newUser);
  };

  const updateRestaurantUser = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, userId } = req.params;
    const updatedUser = await restaurantService.updateRestaurantUser(
      restaurantId,
      userId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_USER_UPDATED",
      `User:${userId}`,
      { updatedData: req.body },
    );
    res.json(updatedUser);
  };

  const deleteRestaurantUser = async (req, res, next) => {
    const { restaurantId, userId } = req.params;
    await restaurantService.deleteRestaurantUser(restaurantId, userId);
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_USER_DELETED",
      `User:${userId}`,
      {},
    );
    res.status(204).send();
  };

  const getRestaurantAddons = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const addons = await restaurantService.getRestaurantAddons(restaurantId);
    res.json(addons);
  };

  const createRestaurantAddon = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newAddon = await restaurantService.createRestaurantAddon(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_ADDON_CREATED",
      `Addon:${newAddon.id}`,
      { name: newAddon.name },
    );
    res.status(201).json(newAddon);
  };

  const updateRestaurantAddon = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, addonId } = req.params;
    const updatedAddon = await restaurantService.updateRestaurantAddon(
      restaurantId,
      addonId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_ADDON_UPDATED",
      `Addon:${addonId}`,
      { updatedData: req.body },
    );
    res.json(updatedAddon);
  };

  const deleteRestaurantAddon = async (req, res, next) => {
    const { restaurantId, addonId } = req.params;
    await restaurantService.deleteRestaurantAddon(restaurantId, addonId);
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_ADDON_DELETED",
      `Addon:${addonId}`,
      {},
    );
    res.status(204).send();
  };

  const getRestaurantCashRegisterCategories = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const categories =
      await restaurantService.getRestaurantCashRegisterCategories(restaurantId);
    res.json(categories);
  };

  const createRestaurantCashRegisterCategory = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newCategory =
      await restaurantService.createRestaurantCashRegisterCategory(
        restaurantId,
        req.body,
      );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_CASH_REGISTER_CATEGORY_CREATED",
      `Category:${newCategory.id}`,
      { name: newCategory.name },
    );
    res.status(201).json(newCategory);
  };

  const updateRestaurantCashRegisterCategory = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, cashRegisterCategoryId } = req.params;
    const updatedCategory =
      await restaurantService.updateRestaurantCashRegisterCategory(
        restaurantId,
        cashRegisterCategoryId,
        req.body,
      );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_CASH_REGISTER_CATEGORY_UPDATED",
      `Category:${cashRegisterCategoryId}`,
      { updatedData: req.body },
    );
    res.json(updatedCategory);
  };

  const deleteRestaurantCashRegisterCategory = async (req, res, next) => {
    const { restaurantId, cashRegisterCategoryId } = req.params;
    await restaurantService.deleteRestaurantCashRegisterCategory(
      restaurantId,
      cashRegisterCategoryId,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_CASH_REGISTER_CATEGORY_DELETED",
      `Category:${cashRegisterCategoryId}`,
      {},
    );
    res.status(204).send();
  };

  const getRestaurantCategories = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const categories =
      await restaurantService.getRestaurantCategories(restaurantId);
    res.json(categories);
  };

  const createRestaurantCategory = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newCategory = await restaurantService.createRestaurantCategory(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_CATEGORY_CREATED",
      `Category:${newCategory.id}`,
      { name: newCategory.name },
    );
    res.status(201).json(newCategory);
  };

  const updateRestaurantCategory = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, categoryId } = req.params;
    const updatedCategory = await restaurantService.updateRestaurantCategory(
      restaurantId,
      categoryId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_CATEGORY_UPDATED",
      `Category:${categoryId}`,
      { updatedData: req.body },
    );
    res.json(updatedCategory);
  };

  const deleteRestaurantCategory = async (req, res, next) => {
    const { restaurantId, categoryId } = req.params;
    await restaurantService.deleteRestaurantCategory(restaurantId, categoryId);
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_CATEGORY_DELETED",
      `Category:${categoryId}`,
      {},
    );
    res.status(204).send();
  };

  const getRestaurantFinancialCategories = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const categories =
      await restaurantService.getRestaurantFinancialCategories(restaurantId);
    res.json(categories);
  };

  const createRestaurantFinancialCategory = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newCategory =
      await restaurantService.createRestaurantFinancialCategory(
        restaurantId,
        req.body,
      );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_FINANCIAL_CATEGORY_CREATED",
      `Category:${newCategory.id}`,
      { name: newCategory.name },
    );
    res.status(201).json(newCategory);
  };

  const updateRestaurantFinancialCategory = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, financialCategoryId } = req.params;
    const updatedCategory =
      await restaurantService.updateRestaurantFinancialCategory(
        restaurantId,
        financialCategoryId,
        req.body,
      );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_FINANCIAL_CATEGORY_UPDATED",
      `Category:${financialCategoryId}`,
      { updatedData: req.body },
    );
    res.json(updatedCategory);
  };

  const deleteRestaurantFinancialCategory = async (req, res, next) => {
    const { restaurantId, financialCategoryId } = req.params;
    await restaurantService.deleteRestaurantFinancialCategory(
      restaurantId,
      financialCategoryId,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_FINANCIAL_CATEGORY_DELETED",
      `Category:${financialCategoryId}`,
      {},
    );
    res.status(204).send();
  };

  const getRestaurantIngredients = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const ingredients =
      await restaurantService.getRestaurantIngredients(restaurantId);
    res.json(ingredients);
  };

  const createRestaurantIngredient = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newIngredient = await restaurantService.createRestaurantIngredient(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_INGREDIENT_CREATED",
      `Ingredient:${newIngredient.id}`,
      { name: newIngredient.name },
    );
    res.status(201).json(newIngredient);
  };

  const updateRestaurantIngredient = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, ingredientId } = req.params;
    const updatedIngredient =
      await restaurantService.updateRestaurantIngredient(
        restaurantId,
        ingredientId,
        req.body,
      );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_INGREDIENT_UPDATED",
      `Ingredient:${ingredientId}`,
      { updatedData: req.body },
    );
    res.json(updatedIngredient);
  };

  const deleteRestaurantIngredient = async (req, res, next) => {
    const { restaurantId, ingredientId } = req.params;
    await restaurantService.deleteRestaurantIngredient(
      restaurantId,
      ingredientId,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_INGREDIENT_DELETED",
      `Ingredient:${ingredientId}`,
      {},
    );
    res.status(204).send();
  };

  const getRestaurantProducts = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const products =
      await restaurantService.getRestaurantProducts(restaurantId);
    res.json(products);
  };

  const createRestaurantProduct = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newProduct = await restaurantService.createRestaurantProduct(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_PRODUCT_CREATED",
      `Product:${newProduct.id}`,
      { name: newProduct.name },
    );
    res.status(201).json(newProduct);
  };

  const updateRestaurantProduct = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, productId } = req.params;
    const updatedProduct = await restaurantService.updateRestaurantProduct(
      restaurantId,
      productId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_PRODUCT_UPDATED",
      `Product:${productId}`,
      { updatedData: req.body },
    );
    res.json(updatedProduct);
  };

  const deleteRestaurantProduct = async (req, res, next) => {
    const { restaurantId, productId } = req.params;
    await restaurantService.deleteRestaurantProduct(restaurantId, productId);
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_PRODUCT_DELETED",
      `Product:${productId}`,
      {},
    );
    res.status(204).send();
  };

  const getRestaurantSuppliers = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const suppliers =
      await restaurantService.getRestaurantSuppliers(restaurantId);
    res.json(suppliers);
  };

  const createRestaurantSupplier = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newSupplier = await restaurantService.createRestaurantSupplier(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_SUPPLIER_CREATED",
      `Supplier:${newSupplier.id}`,
      { name: newSupplier.name },
    );
    res.status(201).json(newSupplier);
  };

  const updateRestaurantSupplier = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, supplierId } = req.params;
    const updatedSupplier =
      await restaurantService.updateRestaurantSupplier(
        restaurantId,
        supplierId,
        req.body,
      );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_SUPPLIER_UPDATED",
      `Supplier:${supplierId}`,
      { updatedData: req.body },
    );
    res.json(updatedSupplier);
  };

  const deleteRestaurantSupplier = async (req, res, next) => {
    const { restaurantId, supplierId } = req.params;
    await restaurantService.deleteRestaurantSupplier(restaurantId, supplierId);
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_SUPPLIER_DELETED",
      `Supplier:${supplierId}`,
      {},
    );
    res.status(204).send();
  };

  const getRestaurantTables = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const tables = await restaurantService.getRestaurantTables(restaurantId);
    res.json(tables);
  };

  const createRestaurantTable = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newTable = await restaurantService.createRestaurantTable(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_TABLE_CREATED",
      `Table:${newTable.id}`,
      { tableNumber: newTable.table_number },
    );
    res.status(201).json(newTable);
  };

  const updateRestaurantTable = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, tableId } = req.params;
    const updatedTable = await restaurantService.updateRestaurantTable(
      restaurantId,
      tableId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_TABLE_UPDATED",
      `Table:${tableId}`,
      { updatedData: req.body },
    );
    res.json(updatedTable);
  };

  const deleteRestaurantTable = async (req, res, next) => {
    const { restaurantId, tableId } = req.params;
    await restaurantService.deleteRestaurantTable(restaurantId, tableId);
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_TABLE_DELETED",
      `Table:${tableId}`,
      {},
    );
    res.status(204).send();
  };

  const getRestaurantTechnicalSpecifications = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const specs =
      await restaurantService.getRestaurantTechnicalSpecifications(restaurantId);
    res.json(specs);
  };

  const createRestaurantTechnicalSpecification = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newSpec =
      await restaurantService.createRestaurantTechnicalSpecification(
        restaurantId,
        req.body,
      );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_TECHNICAL_SPEC_CREATED",
      `Spec:${newSpec.id}`,
      { name: newSpec.name },
    );
    res.status(201).json(newSpec);
  };

  const updateRestaurantTechnicalSpecification = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, technicalSpecificationId } = req.params;
    const updatedSpec =
      await restaurantService.updateRestaurantTechnicalSpecification(
        restaurantId,
        technicalSpecificationId,
        req.body,
      );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_TECHNICAL_SPEC_UPDATED",
      `Spec:${technicalSpecificationId}`,
      { updatedData: req.body },
    );
    res.json(updatedSpec);
  };

  const deleteRestaurantTechnicalSpecification = async (req, res, next) => {
    const { restaurantId, technicalSpecificationId } = req.params;
    await restaurantService.deleteRestaurantTechnicalSpecification(
      restaurantId,
      technicalSpecificationId,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "RESTAURANT_TECHNICAL_SPEC_DELETED",
      `Spec:${technicalSpecificationId}`,
      {},
    );
    res.status(204).send();
  };

  const getWaiterProducts = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const products = await restaurantService.getWaiterProducts(restaurantId);
    res.json(products);
  };

  const createWaiterOrder = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newOrder = await restaurantService.createWaiterOrder(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "WAITER_ORDER_CREATED",
      `Order:${newOrder.id}`,
      { tableId: req.body.table_id, totalItems: req.body.items.length },
    );
    res.status(201).json(newOrder);
  };

  const updateWaiterOrder = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, orderId } = req.params;
    const updatedOrder = await restaurantService.updateWaiterOrder(
      restaurantId,
      orderId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "WAITER_ORDER_UPDATED",
      `Order:${orderId}`,
      { updatedData: req.body },
    );
    res.json(updatedOrder);
  };

  const getWaiterOrderById = async (req, res, next) => {
    const { restaurantId, orderId } = req.params;
    const order = await restaurantService.getWaiterOrderById(
      restaurantId,
      orderId,
    );
    res.json(order);
  };

  const getWaiterOrders = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const orders = await restaurantService.getWaiterOrders(restaurantId);
    res.json(orders);
  };

  const createWaiterCall = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const newCall = await restaurantService.createWaiterCall(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "WAITER_CALL_CREATED",
      `Call:${newCall.id}`,
      { tableId: req.body.table_id, callType: req.body.call_type },
    );
    res.status(201).json(newCall);
  };

  const updateWaiterCall = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurantId, callId } = req.params;
    const updatedCall = await restaurantService.updateWaiterCall(
      restaurantId,
      callId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "WAITER_CALL_UPDATED",
      `Call:${callId}`,
      { updatedData: req.body },
    );
    res.json(updatedCall);
  };

  const getWaiterCalls = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const calls = await restaurantService.getWaiterCalls(restaurantId);
    res.json(calls);
  };

  const getWaiterCallById = async (req, res, next) => {
    const { restaurantId, callId } = req.params;
    const call = await restaurantService.getWaiterCallById(
      restaurantId,
      callId,
    );
    res.json(call);
  };

  const deleteWaiterCall = async (req, res, next) => {
    const { restaurantId, callId } = req.params;
    await restaurantService.deleteWaiterCall(restaurantId, callId);
    await auditService.log(
      req.user,
      restaurantId,
      "WAITER_CALL_DELETED",
      `Call:${callId}`,
      {},
    );
    res.status(204).send();
  };

  return {
    getRestaurantById,
    listRestaurants,
    updateRestaurant,
    updateRestaurantOpenStatus,
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