const express = require('express');

const requirePermission = require('../../middleware/requirePermission');
const restaurantController = require('./restaurant.controller');
const {
  updateRestaurantStatusValidation,
  updateRestaurantPosStatusValidation,
  userValidation,
  updateUserValidation,
  addonValidation,
  cashRegisterCategoryValidation,
  categoryValidation,
  financialCategoryValidation,
  ingredientValidation,
  productValidation,
  supplierValidation,
  tableValidation,
  technicalSpecificationValidation,
  createWaiterOrderValidation,
  updateWaiterOrderValidation,
  createWaiterCallValidation,
  updateWaiterCallValidation,
  updateRestaurantValidation, // Added this line
} = require('./restaurant.validation');

module.exports = (db) => {
  const { auth } = require('../../middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Gerenciamento de Restaurante
  router.get('/', auth, requirePermission('restaurant_management', 'read'), restaurantController.getRestaurantById);
  router.put('/', auth, requirePermission('restaurant_management', 'update'), updateRestaurantValidation, restaurantController.updateRestaurant); // Added updateRestaurantValidation
  router.put('/status/open', auth, requirePermission('restaurant_management', 'update'), updateRestaurantStatusValidation, restaurantController.updateRestaurantOpenStatus);
  router.put('/pos-status', auth, requirePermission('restaurant_management', 'update'), updateRestaurantPosStatusValidation, restaurantController.updateRestaurantPosStatus);

  // Rotas de Usuários do Restaurante
  router.get('/users', auth, requirePermission('restaurant_users', 'read'), restaurantController.listRestaurantUsers);
  router.post('/users', auth, requirePermission('restaurant_users', 'create'), userValidation, restaurantController.createRestaurantUser);
  router.put('/users/:userId', auth, requirePermission('restaurant_users', 'update'), updateUserValidation, restaurantController.updateRestaurantUser);
  router.delete('/users/:userId', auth, requirePermission('restaurant_users', 'delete'), restaurantController.deleteRestaurantUser);

  // Rotas de Adicionais (Addons)
  router.get('/addons', auth, requirePermission('restaurant_addons', 'read'), restaurantController.getRestaurantAddons);
  router.post('/addons', auth, requirePermission('restaurant_addons', 'create'), addonValidation, restaurantController.createRestaurantAddon);
  router.put('/addons/:addonId', auth, requirePermission('restaurant_addons', 'update'), addonValidation, restaurantController.updateRestaurantAddon);
  router.delete('/addons/:addonId', auth, requirePermission('restaurant_addons', 'delete'), restaurantController.deleteRestaurantAddon);

  // Rotas de Categorias de Caixa (Cash Register Categories)
  router.get('/cash-register-categories', auth, requirePermission('restaurant_cash_register_categories', 'read'), restaurantController.getRestaurantCashRegisterCategories);
  router.post('/cash-register-categories', auth, requirePermission('restaurant_cash_register_categories', 'create'), cashRegisterCategoryValidation, restaurantController.createRestaurantCashRegisterCategory);
  router.put('/cash-register-categories/:cashRegisterCategoryId', auth, requirePermission('restaurant_cash_register_categories', 'update'), cashRegisterCategoryValidation, restaurantController.updateRestaurantCashRegisterCategory);
  router.delete('/cash-register-categories/:cashRegisterCategoryId', auth, requirePermission('restaurant_cash_register_categories', 'delete'), restaurantController.deleteRestaurantCashRegisterCategory);

  // Rotas de Categorias (Categories)
  router.get('/categories', auth, requirePermission('restaurant_categories', 'read'), restaurantController.getRestaurantCategories);
  router.post('/categories', auth, requirePermission('restaurant_categories', 'create'), categoryValidation, restaurantController.createRestaurantCategory);
  router.put('/categories/:categoryId', auth, requirePermission('restaurant_categories', 'update'), categoryValidation, restaurantController.updateRestaurantCategory);
  router.delete('/categories/:categoryId', auth, requirePermission('restaurant_categories', 'delete'), restaurantController.deleteRestaurantCategory);

  // Rotas de Categorias Financeiras (Financial Categories)
  router.get('/financial-categories', auth, requirePermission('restaurant_financial_categories', 'read'), restaurantController.getRestaurantFinancialCategories);
  router.post('/financial-categories', auth, requirePermission('restaurant_financial_categories', 'create'), financialCategoryValidation, restaurantController.createRestaurantFinancialCategory);
  router.put('/financial-categories/:financialCategoryId', auth, requirePermission('restaurant_financial_categories', 'update'), financialCategoryValidation, restaurantController.updateRestaurantFinancialCategory);
  router.delete('/financial-categories/:financialCategoryId', auth, requirePermission('restaurant_financial_categories', 'delete'), restaurantController.deleteRestaurantFinancialCategory);

  // Rotas de Ingredientes (Ingredients)
  router.get('/ingredients', auth, requirePermission('restaurant_ingredients', 'read'), restaurantController.getRestaurantIngredients);
  router.post('/ingredients', auth, requirePermission('restaurant_ingredients', 'create'), ingredientValidation, restaurantController.createRestaurantIngredient);
  router.put('/ingredients/:ingredientId', auth, requirePermission('restaurant_ingredients', 'update'), ingredientValidation, restaurantController.updateRestaurantIngredient);
  router.delete('/ingredients/:ingredientId', auth, requirePermission('restaurant_ingredients', 'delete'), restaurantController.deleteRestaurantIngredient);

  // Rotas de Produtos (Products)
  router.get('/products', auth, requirePermission('restaurant_products', 'read'), restaurantController.getRestaurantProducts);
  router.post('/products', auth, requirePermission('restaurant_products', 'create'), productValidation, restaurantController.createRestaurantProduct);
  router.put('/products/:productId', auth, requirePermission('restaurant_products', 'update'), productValidation, restaurantController.updateRestaurantProduct);
  router.delete('/:productId', auth, requirePermission('restaurant_products', 'delete'), restaurantController.deleteRestaurantProduct);

  // Rotas de Fornecedores (Suppliers)
  router.get('/suppliers', auth, requirePermission('restaurant_suppliers', 'read'), restaurantController.getRestaurantSuppliers);
  router.post('/suppliers', auth, requirePermission('restaurant_suppliers', 'create'), supplierValidation, restaurantController.createRestaurantSupplier);
  router.put('/suppliers/:supplierId', auth, requirePermission('restaurant_suppliers', 'update'), supplierValidation, restaurantController.updateRestaurantSupplier);
  router.delete('/suppliers/:supplierId', auth, requirePermission('restaurant_suppliers', 'delete'), restaurantController.deleteRestaurantSupplier);

  // Rotas de Mesas (Tables)
  router.get('/tables', auth, requirePermission('restaurant_tables', 'read'), restaurantController.getRestaurantTables);
  router.post('/tables', auth, requirePermission('restaurant_tables', 'create'), tableValidation, restaurantController.createRestaurantTable);
  router.put('/tables/:tableId', auth, requirePermission('restaurant_tables', 'update'), tableValidation, restaurantController.updateRestaurantTable);
  router.delete('/tables/:tableId', auth, requirePermission('restaurant_tables', 'delete'), restaurantController.deleteRestaurantTable);

  // Rotas de Fichas Técnicas (Technical Specifications)
  router.get('/technical-specifications', auth, requirePermission('restaurant_technical_specifications', 'read'), restaurantController.getRestaurantTechnicalSpecifications);
  router.post('/technical-specifications', auth, requirePermission('restaurant_technical_specifications', 'create'), technicalSpecificationValidation, restaurantController.createRestaurantTechnicalSpecification);
  router.put('/technical-specifications/:technicalSpecificationId', auth, requirePermission('restaurant_technical_specifications', 'update'), technicalSpecificationValidation, restaurantController.updateRestaurantTechnicalSpecification);
  router.delete('/technical-specifications/:technicalSpecificationId', auth, requirePermission('restaurant_technical_specifications', 'delete'), restaurantController.deleteRestaurantTechnicalSpecification);

  // Rotas de Garçom (Waiter/PDV)
  router.post('/waiter/orders', auth, requirePermission('waiter_orders', 'create'), createWaiterOrderValidation, restaurantController.createWaiterOrder);
  router.put('/waiter/orders/:orderId', auth, requirePermission('waiter_orders', 'update'), updateWaiterOrderValidation, restaurantController.updateWaiterOrder);
  router.get('/waiter/orders/:orderId', auth, requirePermission('waiter_orders', 'read'), restaurantController.getWaiterOrderById);
  router.get('/waiter/orders', auth, requirePermission('waiter_orders', 'read'), restaurantController.getWaiterOrders);
  router.post('/waiter/calls', auth, requirePermission('waiter_calls', 'create'), createWaiterCallValidation, restaurantController.createWaiterCall);
  router.put('/waiter/calls/:callId', auth, requirePermission('waiter_calls', 'update'), updateWaiterCallValidation, restaurantController.updateWaiterCall);
  router.get('/waiter/calls', auth, requirePermission('waiter_calls', 'read'), restaurantController.getWaiterCalls);
  router.get('/waiter/calls/:callId', auth, requirePermission('waiter_calls', 'read'), restaurantController.getWaiterCallById);
  router.delete('/waiter/calls/:callId', auth, requirePermission('waiter_calls', 'delete'), restaurantController.deleteWaiterCall);


  return router;
};