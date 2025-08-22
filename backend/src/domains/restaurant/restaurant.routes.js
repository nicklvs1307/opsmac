const express = require('express');
const express = require('express');
const { auth, authorize } = require('../../middleware/auth');
const getRestaurantId = require('../../src/middleware/getRestaurantMiddleware');
const { isOwnerOrManager } = require('../middleware/ownerOrManagerAuthMiddleware');
const { isPdvUser } = require('../middleware/pdvUserAuthMiddleware');
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
} = require('./restaurant.validation');


// Rotas de Gerenciamento de Restaurante
router.get('/', authorize('admin', 'owner', 'manager'), restaurantController.getRestaurantById);
router.put('/', authorize('admin', 'owner', 'manager'), restaurantController.updateRestaurant);
router.put('/status/open', authorize('admin', 'owner', 'manager'), updateRestaurantStatusValidation, restaurantController.updateRestaurantOpenStatus);
router.put('/pos-status', authorize('admin', 'owner', 'manager'), updateRestaurantPosStatusValidation, restaurantController.updateRestaurantPosStatus);

// Rotas de Usuários do Restaurante
router.get('/users', isOwnerOrManager, restaurantController.listRestaurantUsers);
router.post('/users', isOwnerOrManager, userValidation, restaurantController.createRestaurantUser);
router.put('/users/:userId', isOwnerOrManager, updateUserValidation, restaurantController.updateRestaurantUser);
router.delete('/users/:userId', isOwnerOrManager, restaurantController.deleteRestaurantUser);

// Rotas de Adicionais (Addons)
router.get('/addons', authorize('admin', 'owner', 'manager'), restaurantController.getRestaurantAddons);
router.post('/addons', authorize('admin', 'owner', 'manager'), addonValidation, restaurantController.createRestaurantAddon);
router.put('/addons/:addonId', authorize('admin', 'owner', 'manager'), addonValidation, restaurantController.updateRestaurantAddon);
router.delete('/addons/:addonId', authorize('admin', 'owner', 'manager'), restaurantController.deleteRestaurantAddon);

// Rotas de Categorias de Caixa (Cash Register Categories)
router.get('/cash-register-categories', authorize('admin', 'owner', 'manager'), restaurantController.getRestaurantCashRegisterCategories);
router.post('/cash-register-categories', authorize('admin', 'owner', 'manager'), cashRegisterCategoryValidation, restaurantController.createRestaurantCashRegisterCategory);
router.put('/cash-register-categories/:cashRegisterCategoryId', authorize('admin', 'owner', 'manager'), cashRegisterCategoryValidation, restaurantController.updateRestaurantCashRegisterCategory);
router.delete('/cash-register-categories/:cashRegisterCategoryId', authorize('admin', 'owner', 'manager'), restaurantController.deleteRestaurantCashRegisterCategory);

// Rotas de Categorias (Categories)
router.get('/categories', authorize('admin', 'owner', 'manager'), restaurantController.getRestaurantCategories);
router.post('/categories', authorize('admin', 'owner', 'manager'), categoryValidation, restaurantController.createRestaurantCategory);
router.put('/categories/:categoryId', authorize('admin', 'owner', 'manager'), categoryValidation, restaurantController.updateRestaurantCategory);
router.delete('/categories/:categoryId', authorize('admin', 'owner', 'manager'), restaurantController.deleteRestaurantCategory);

// Rotas de Categorias Financeiras (Financial Categories)
router.get('/financial-categories', authorize('admin', 'owner', 'manager'), restaurantController.getRestaurantFinancialCategories);
router.post('/financial-categories', authorize('admin', 'owner', 'manager'), financialCategoryValidation, restaurantController.createRestaurantFinancialCategory);
router.put('/financial-categories/:financialCategoryId', authorize('admin', 'owner', 'manager'), financialCategoryValidation, restaurantController.updateRestaurantFinancialCategory);
router.delete('/financial-categories/:financialCategoryId', authorize('admin', 'owner', 'manager'), restaurantController.deleteRestaurantFinancialCategory);

// Rotas de Ingredientes (Ingredients)
router.get('/ingredients', authorize('admin', 'owner', 'manager'), restaurantController.getRestaurantIngredients);
router.post('/ingredients', authorize('admin', 'owner', 'manager'), ingredientValidation, restaurantController.createRestaurantIngredient);
router.put('/ingredients/:ingredientId', authorize('admin', 'owner', 'manager'), ingredientValidation, restaurantController.updateRestaurantIngredient);
router.delete('/ingredients/:ingredientId', authorize('admin', 'owner', 'manager'), restaurantController.deleteRestaurantIngredient);

// Rotas de Produtos (Products)
router.get('/products', authorize('admin', 'owner', 'manager', 'waiter'), restaurantController.getRestaurantProducts);
router.post('/products', authorize('admin', 'owner', 'manager'), productValidation, restaurantController.createRestaurantProduct);
router.put('/products/:productId', authorize('admin', 'owner', 'manager'), productValidation, restaurantController.updateRestaurantProduct);
router.delete('/products/:productId', authorize('admin', 'owner', 'manager'), restaurantController.deleteRestaurantProduct);

// Rotas de Fornecedores (Suppliers)
router.get('/suppliers', authorize('admin', 'owner', 'manager'), restaurantController.getRestaurantSuppliers);
router.post('/suppliers', authorize('admin', 'owner', 'manager'), supplierValidation, restaurantController.createRestaurantSupplier);
router.put('/suppliers/:supplierId', authorize('admin', 'owner', 'manager'), supplierValidation, restaurantController.updateRestaurantSupplier);
router.delete('/suppliers/:supplierId', authorize('admin', 'owner', 'manager'), restaurantController.deleteRestaurantSupplier);

// Rotas de Mesas (Tables)
router.get('/tables', authorize('admin', 'owner', 'manager'), restaurantController.getRestaurantTables);
router.post('/tables', authorize('admin', 'owner', 'manager'), tableValidation, restaurantController.createRestaurantTable);
router.put('/tables/:tableId', authorize('admin', 'owner', 'manager'), tableValidation, restaurantController.updateRestaurantTable);
router.delete('/tables/:tableId', authorize('admin', 'owner', 'manager'), restaurantController.deleteRestaurantTable);

// Rotas de Fichas Técnicas (Technical Specifications)
router.get('/technical-specifications', authorize('admin', 'owner', 'manager'), restaurantController.getRestaurantTechnicalSpecifications);
router.post('/technical-specifications', authorize('admin', 'owner', 'manager'), technicalSpecificationValidation, restaurantController.createRestaurantTechnicalSpecification);
router.put('/technical-specifications/:technicalSpecificationId', authorize('admin', 'owner', 'manager'), technicalSpecificationValidation, restaurantController.updateRestaurantTechnicalSpecification);
router.delete('/technical-specifications/:technicalSpecificationId', authorize('admin', 'owner', 'manager'), restaurantController.deleteRestaurantTechnicalSpecification);

// Rotas de Garçom (Waiter/PDV)
router.post('/waiter/orders', isPdvUser, createWaiterOrderValidation, restaurantController.createWaiterOrder);
router.put('/waiter/orders/:orderId', isPdvUser, updateWaiterOrderValidation, restaurantController.updateWaiterOrder);
router.get('/waiter/orders/:orderId', isPdvUser, restaurantController.getWaiterOrderById);
router.get('/waiter/orders', isPdvUser, restaurantController.getWaiterOrders);
router.post('/waiter/calls', isPdvUser, createWaiterCallValidation, restaurantController.createWaiterCall);
router.put('/waiter/calls/:callId', isPdvUser, updateWaiterCallValidation, restaurantController.updateWaiterCall);
router.get('/waiter/calls', isPdvUser, restaurantController.getWaiterCalls);
router.get('/waiter/calls/:callId', isPdvUser, restaurantController.getWaiterCallById);
router.delete('/waiter/calls/:callId', isPdvUser, restaurantController.deleteWaiterCall);


module.exports = router;
