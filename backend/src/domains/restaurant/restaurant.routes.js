const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');
const { updateRestaurantStatusValidation, updateRestaurantPosStatusValidation, userValidation, updateUserValidation, addonValidation, cashRegisterCategoryValidation, categoryValidation, financialCategoryValidation, ingredientValidation, productValidation, supplierValidation, tableValidation, technicalSpecificationValidation, createWaiterOrderValidation, updateWaiterOrderValidation, createWaiterCallValidation, updateWaiterCallValidation, updateRestaurantValidation, } = require('domains/restaurant/restaurant.validation');

module.exports = (db) => {
  const restaurantService = require('./restaurant.service')(db);
  const restaurantController = require('./restaurant.controller')(restaurantService);
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Gerenciamento de Restaurante
  router.get('/', auth, requirePermission('restaurant_management', 'read'), asyncHandler(restaurantController.getRestaurantById));
    router.put('/', auth, requirePermission('restaurant_management', 'update'), ...updateRestaurantValidation, asyncHandler(restaurantController.updateRestaurant)); // Added updateRestaurantValidation
  router.put('/status/open', auth, requirePermission('restaurant_management', 'update'), ...updateRestaurantStatusValidation, asyncHandler(restaurantController.updateRestaurantOpenStatus));
  router.put('/pos-status', auth, requirePermission('restaurant_management', 'update'), ...updateRestaurantPosStatusValidation, asyncHandler(restaurantController.updateRestaurantPosStatus));

  // Rotas de Usuários do Restaurante
  router.post('/users', auth, requirePermission('restaurant_users', 'create'), ...userValidation, asyncHandler(restaurantController.createRestaurantUser));
  router.put('/users/:userId', auth, requirePermission('restaurant_users', 'update'), ...updateUserValidation, asyncHandler(restaurantController.updateRestaurantUser));

  // Rotas de Adicionais (Addons)
  router.post('/addons', auth, requirePermission('restaurant_addons', 'create'), ...addonValidation, asyncHandler(restaurantController.createRestaurantAddon));
  router.put('/addons/:addonId', auth, requirePermission('restaurant_addons', 'update'), ...addonValidation, asyncHandler(restaurantController.updateRestaurantAddon));

  // Rotas de Categorias de Caixa (Cash Register Categories)
  router.post('/cash-register-categories', auth, requirePermission('restaurant_cash_register_categories', 'create'), ...cashRegisterCategoryValidation, asyncHandler(restaurantController.createRestaurantCashRegisterCategory));
  router.put('/cash-register-categories/:cashRegisterCategoryId', auth, requirePermission('restaurant_cash_register_categories', 'update'), ...cashRegisterCategoryValidation, asyncHandler(restaurantController.updateRestaurantCashRegisterCategory));

  // Rotas de Categorias (Categories)
  router.post('/categories', auth, requirePermission('restaurant_categories', 'create'), ...categoryValidation, asyncHandler(restaurantController.createRestaurantCategory));
  router.put('/categories/:categoryId', auth, requirePermission('restaurant_categories', 'update'), ...categoryValidation, asyncHandler(restaurantController.updateRestaurantCategory));

  // Rotas de Categorias Financeiras (Financial Categories)
  router.post('/financial-categories', auth, requirePermission('restaurant_financial_categories', 'create'), ...financialCategoryValidation, asyncHandler(restaurantController.createRestaurantFinancialCategory));
  router.put('/financial-categories/:financialCategoryId', auth, requirePermission('restaurant_financial_categories', 'update'), ...financialCategoryValidation, asyncHandler(restaurantController.updateRestaurantFinancialCategory));

  // Rotas de Ingredientes (Ingredients)
  router.post('/ingredients', auth, requirePermission('restaurant_ingredients', 'create'), ...ingredientValidation, asyncHandler(restaurantController.createRestaurantIngredient));
  router.put('/ingredients/:ingredientId', auth, requirePermission('restaurant_ingredients', 'update'), ...ingredientValidation, asyncHandler(restaurantController.updateRestaurantIngredient));

  // Rotas de Produtos (Products)
  router.post('/products', auth, requirePermission('restaurant_products', 'create'), ...productValidation, asyncHandler(restaurantController.createRestaurantProduct));
  router.put('/products/:productId', auth, requirePermission('restaurant_products', 'update'), ...productValidation, asyncHandler(restaurantController.updateRestaurantProduct));

  // Rotas de Fornecedores (Suppliers)
  router.post('/suppliers', auth, requirePermission('restaurant_suppliers', 'create'), ...supplierValidation, asyncHandler(restaurantController.createRestaurantSupplier));
  router.put('/suppliers/:supplierId', auth, requirePermission('restaurant_suppliers', 'update'), ...supplierValidation, asyncHandler(restaurantController.updateRestaurantSupplier));

  // Rotas de Mesas (Tables)
  router.post('/tables', auth, requirePermission('restaurant_tables', 'create'), ...tableValidation, asyncHandler(restaurantController.createRestaurantTable));
  router.put('/tables/:tableId', auth, requirePermission('restaurant_tables', 'update'), ...tableValidation, asyncHandler(restaurantController.updateRestaurantTable));

  // Rotas de Fichas Técnicas (Technical Specifications)
  router.post('/technical-specifications', auth, requirePermission('restaurant_technical_specifications', 'create'), ...technicalSpecificationValidation, asyncHandler(restaurantController.createRestaurantTechnicalSpecification));
  router.put('/technical-specifications/:technicalSpecificationId', auth, requirePermission('restaurant_technical_specifications', 'update'), ...technicalSpecificationValidation, asyncHandler(restaurantController.updateRestaurantTechnicalSpecification));

  // Rotas de Garçom (Waiter/PDV)
  router.post('/waiter/orders', auth, requirePermission('waiter_orders', 'create'), ...createWaiterOrderValidation, asyncHandler(restaurantController.createWaiterOrder));
  router.put('/waiter/orders/:orderId', auth, requirePermission('waiter_orders', 'update'), ...updateWaiterOrderValidation, asyncHandler(restaurantController.updateWaiterOrder));
  router.post('/waiter/calls', auth, requirePermission('waiter_calls', 'create'), ...createWaiterCallValidation, asyncHandler(restaurantController.createWaiterCall));
  router.put('/waiter/calls/:callId', auth, requirePermission('waiter_calls', 'update'), ...updateWaiterCallValidation, asyncHandler(restaurantController.updateWaiterCall));
  router.put('/status/open', auth, requirePermission('restaurant_management', 'update'), updateRestaurantStatusValidation, asyncHandler(restaurantController.updateRestaurantOpenStatus));
  router.put('/pos-status', auth, requirePermission('restaurant_management', 'update'), updateRestaurantPosStatusValidation, asyncHandler(restaurantController.updateRestaurantPosStatus));

  // Rotas de Usuários do Restaurante
  router.get('/users', auth, requirePermission('restaurant_users', 'read'), asyncHandler(restaurantController.listRestaurantUsers));
  router.post('/users', auth, requirePermission('restaurant_users', 'create'), userValidation, asyncHandler(restaurantController.createRestaurantUser));
  router.put('/users/:userId', auth, requirePermission('restaurant_users', 'update'), updateUserValidation, asyncHandler(restaurantController.updateRestaurantUser));
  router.delete('/users/:userId', auth, requirePermission('restaurant_users', 'delete'), asyncHandler(restaurantController.deleteRestaurantUser));

  // Rotas de Adicionais (Addons)
  router.get('/addons', auth, requirePermission('restaurant_addons', 'read'), asyncHandler(restaurantController.getRestaurantAddons));
  router.post('/addons', auth, requirePermission('restaurant_addons', 'create'), addonValidation, asyncHandler(restaurantController.createRestaurantAddon));
  router.put('/addons/:addonId', auth, requirePermission('restaurant_addons', 'update'), addonValidation, asyncHandler(restaurantController.updateRestaurantAddon));
  router.delete('/addons/:addonId', auth, requirePermission('restaurant_addons', 'delete'), asyncHandler(restaurantController.deleteRestaurantAddon));

  // Rotas de Categorias de Caixa (Cash Register Categories)
  router.get('/cash-register-categories', auth, requirePermission('restaurant_cash_register_categories', 'read'), asyncHandler(restaurantController.getRestaurantCashRegisterCategories));
  router.post('/cash-register-categories', auth, requirePermission('restaurant_cash_register_categories', 'create'), cashRegisterCategoryValidation, asyncHandler(restaurantController.createRestaurantCashRegisterCategory));
  router.put('/cash-register-categories/:cashRegisterCategoryId', auth, requirePermission('restaurant_cash_register_categories', 'update'), cashRegisterCategoryValidation, asyncHandler(restaurantController.updateRestaurantCashRegisterCategory));
  router.delete('/cash-register-categories/:cashRegisterCategoryId', auth, requirePermission('restaurant_cash_register_categories', 'delete'), asyncHandler(restaurantController.deleteRestaurantCashRegisterCategory));

  // Rotas de Categorias (Categories)
  router.get('/categories', auth, requirePermission('restaurant_categories', 'read'), asyncHandler(restaurantController.getRestaurantCategories));
  router.post('/categories', auth, requirePermission('restaurant_categories', 'create'), categoryValidation, asyncHandler(restaurantController.createRestaurantCategory));
  router.put('/categories/:categoryId', auth, requirePermission('restaurant_categories', 'update'), categoryValidation, asyncHandler(restaurantController.updateRestaurantCategory));
  router.delete('/categories/:categoryId', auth, requirePermission('restaurant_categories', 'delete'), asyncHandler(restaurantController.deleteRestaurantCategory));

  // Rotas de Categorias Financeiras (Financial Categories)
  router.get('/financial-categories', auth, requirePermission('restaurant_financial_categories', 'read'), asyncHandler(restaurantController.getRestaurantFinancialCategories));
  router.post('/financial-categories', auth, requirePermission('restaurant_financial_categories', 'create'), financialCategoryValidation, asyncHandler(restaurantController.createRestaurantFinancialCategory));
  router.put('/financial-categories/:financialCategoryId', auth, requirePermission('restaurant_financial_categories', 'update'), financialCategoryValidation, asyncHandler(restaurantController.updateRestaurantFinancialCategory));
  router.delete('/financial-categories/:financialCategoryId', auth, requirePermission('restaurant_financial_categories', 'delete'), asyncHandler(restaurantController.deleteRestaurantFinancialCategory));

  // Rotas de Ingredientes (Ingredients)
  router.get('/ingredients', auth, requirePermission('restaurant_ingredients', 'read'), asyncHandler(restaurantController.getRestaurantIngredients));
  router.post('/ingredients', auth, requirePermission('restaurant_ingredients', 'create'), ingredientValidation, asyncHandler(restaurantController.createRestaurantIngredient));
  router.put('/ingredients/:ingredientId', auth, requirePermission('restaurant_ingredients', 'update'), ingredientValidation, asyncHandler(restaurantController.updateRestaurantIngredient));
  router.delete('/ingredients/:ingredientId', auth, requirePermission('restaurant_ingredients', 'delete'), asyncHandler(restaurantController.deleteRestaurantIngredient));

  // Rotas de Produtos (Products)
  router.get('/products', auth, requirePermission('restaurant_products', 'read'), asyncHandler(restaurantController.getRestaurantProducts));
  router.post('/products', auth, requirePermission('restaurant_products', 'create'), productValidation, asyncHandler(restaurantController.createRestaurantProduct));
  router.put('/products/:productId', auth, requirePermission('restaurant_products', 'update'), productValidation, asyncHandler(restaurantController.updateRestaurantProduct));
  router.delete('/:productId', auth, requirePermission('restaurant_products', 'delete'), asyncHandler(restaurantController.deleteRestaurantProduct));

  // Rotas de Fornecedores (Suppliers)
  router.get('/suppliers', auth, requirePermission('restaurant_suppliers', 'read'), asyncHandler(restaurantController.getRestaurantSuppliers));
  router.post('/suppliers', auth, requirePermission('restaurant_suppliers', 'create'), supplierValidation, asyncHandler(restaurantController.createRestaurantSupplier));
  router.put('/suppliers/:supplierId', auth, requirePermission('restaurant_suppliers', 'update'), supplierValidation, asyncHandler(restaurantController.updateRestaurantSupplier));
  router.delete('/suppliers/:supplierId', auth, requirePermission('restaurant_suppliers', 'delete'), asyncHandler(restaurantController.deleteRestaurantSupplier));

  // Rotas de Mesas (Tables)
  router.get('/tables', auth, requirePermission('restaurant_tables', 'read'), asyncHandler(restaurantController.getRestaurantTables));
  router.post('/tables', auth, requirePermission('restaurant_tables', 'create'), tableValidation, asyncHandler(restaurantController.createRestaurantTable));
  router.put('/tables/:tableId', auth, requirePermission('restaurant_tables', 'update'), tableValidation, asyncHandler(restaurantController.updateRestaurantTable));
  router.delete('/tables/:tableId', auth, requirePermission('restaurant_tables', 'delete'), asyncHandler(restaurantController.deleteRestaurantTable));

  // Rotas de Fichas Técnicas (Technical Specifications)
  router.get('/technical-specifications', auth, requirePermission('restaurant_technical_specifications', 'read'), asyncHandler(restaurantController.getRestaurantTechnicalSpecifications));
  router.post('/technical-specifications', auth, requirePermission('restaurant_technical_specifications', 'create'), technicalSpecificationValidation, asyncHandler(restaurantController.createRestaurantTechnicalSpecification));
  router.put('/technical-specifications/:technicalSpecificationId', auth, requirePermission('restaurant_technical_specifications', 'update'), technicalSpecificationValidation, asyncHandler(restaurantController.updateRestaurantTechnicalSpecification));
  router.delete('/technical-specifications/:technicalSpecificationId', auth, requirePermission('restaurant_technical_specifications', 'delete'), asyncHandler(restaurantController.deleteRestaurantTechnicalSpecification));

  // Rotas de Garçom (Waiter/PDV)
  router.post('/waiter/orders', auth, requirePermission('waiter_orders', 'create'), createWaiterOrderValidation, asyncHandler(restaurantController.createWaiterOrder));
  router.put('/waiter/orders/:orderId', auth, requirePermission('waiter_orders', 'update'), updateWaiterOrderValidation, asyncHandler(restaurantController.updateWaiterOrder));
  router.get('/waiter/orders/:orderId', auth, requirePermission('waiter_orders', 'read'), asyncHandler(restaurantController.getWaiterOrderById));
  router.get('/waiter/orders', auth, requirePermission('waiter_orders', 'read'), asyncHandler(restaurantController.getWaiterOrders));
  router.post('/waiter/calls', auth, requirePermission('waiter_calls', 'create'), createWaiterCallValidation, asyncHandler(restaurantController.createWaiterCall));
  router.put('/waiter/calls/:callId', auth, requirePermission('waiter_calls', 'update'), updateWaiterCallValidation, asyncHandler(restaurantController.updateWaiterCall));
  router.get('/waiter/calls', auth, requirePermission('waiter_calls', 'read'), asyncHandler(restaurantController.getWaiterCalls));
  router.get('/waiter/calls/:callId', auth, requirePermission('waiter_calls', 'read'), asyncHandler(restaurantController.getWaiterCallById));
  router.delete('/waiter/calls/:callId', auth, requirePermission('waiter_calls', 'delete'), asyncHandler(restaurantController.deleteWaiterCall));


  return router;
};