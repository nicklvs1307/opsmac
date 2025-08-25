const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
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

const router = express.Router();

// Rotas de Gerenciamento de Restaurante
router.get('/', auth, checkPermission('restaurant:view'), restaurantController.getRestaurantById);
router.put('/', auth, checkPermission('restaurant:edit'), restaurantController.updateRestaurant);
router.put('/status/open', auth, checkPermission('restaurant:edit'), updateRestaurantStatusValidation, restaurantController.updateRestaurantOpenStatus);
router.put('/pos-status', auth, checkPermission('restaurant:edit'), updateRestaurantPosStatusValidation, restaurantController.updateRestaurantPosStatus);

// Rotas de Usuários do Restaurante
router.get('/users', auth, checkPermission('users:view'), restaurantController.listRestaurantUsers);
router.post('/users', auth, checkPermission('users:create'), userValidation, restaurantController.createRestaurantUser);
router.put('/users/:userId', auth, checkPermission('users:edit'), updateUserValidation, restaurantController.updateRestaurantUser);
router.delete('/users/:userId', auth, checkPermission('users:delete'), restaurantController.deleteRestaurantUser);

// Rotas de Adicionais (Addons)
router.get('/addons', auth, checkPermission('addons:view'), restaurantController.getRestaurantAddons);
router.post('/addons', auth, checkPermission('addons:create'), addonValidation, restaurantController.createRestaurantAddon);
router.put('/addons/:addonId', auth, checkPermission('addons:edit'), addonValidation, restaurantController.updateRestaurantAddon);
router.delete('/addons/:addonId', auth, checkPermission('addons:delete'), restaurantController.deleteRestaurantAddon);

// Rotas de Categorias de Caixa (Cash Register Categories)
router.get('/cash-register-categories', auth, checkPermission('cashRegisterCategories:view'), restaurantController.getRestaurantCashRegisterCategories);
router.post('/cash-register-categories', auth, checkPermission('cashRegisterCategories:create'), cashRegisterCategoryValidation, restaurantController.createRestaurantCashRegisterCategory);
router.put('/cash-register-categories/:cashRegisterCategoryId', auth, checkPermission('cashRegisterCategories:edit'), cashRegisterCategoryValidation, restaurantController.updateRestaurantCashRegisterCategory);
router.delete('/cash-register-categories/:cashRegisterCategoryId', auth, checkPermission('cashRegisterCategories:delete'), restaurantController.deleteRestaurantCashRegisterCategory);

// Rotas de Categorias (Categories)
router.get('/categories', auth, checkPermission('categories:view'), restaurantController.getRestaurantCategories);
router.post('/categories', auth, checkPermission('categories:create'), categoryValidation, restaurantController.createRestaurantCategory);
router.put('/categories/:categoryId', auth, checkPermission('categories:edit'), categoryValidation, restaurantController.updateRestaurantCategory);
router.delete('/categories/:categoryId', auth, checkPermission('categories:delete'), restaurantController.deleteRestaurantCategory);

// Rotas de Categorias Financeiras (Financial Categories)
router.get('/financial-categories', auth, checkPermission('financialCategories:view'), restaurantController.getRestaurantFinancialCategories);
router.post('/financial-categories', auth, checkPermission('financialCategories:create'), financialCategoryValidation, restaurantController.createRestaurantFinancialCategory);
router.put('/financial-categories/:financialCategoryId', auth, checkPermission('financialCategories:edit'), financialCategoryValidation, restaurantController.updateRestaurantFinancialCategory);
router.delete('/financial-categories/:financialCategoryId', auth, checkPermission('financialCategories:delete'), restaurantController.deleteRestaurantFinancialCategory);

// Rotas de Ingredientes (Ingredients)
router.get('/ingredients', auth, checkPermission('ingredients:view'), restaurantController.getRestaurantIngredients);
router.post('/ingredients', auth, checkPermission('ingredients:create'), ingredientValidation, restaurantController.createRestaurantIngredient);
router.put('/ingredients/:ingredientId', auth, checkPermission('ingredients:edit'), ingredientValidation, restaurantController.updateRestaurantIngredient);
router.delete('/ingredients/:ingredientId', auth, checkPermission('ingredients:delete'), restaurantController.deleteRestaurantIngredient);

// Rotas de Produtos (Products)
router.get('/products', auth, checkPermission('products:view'), restaurantController.getRestaurantProducts);
router.post('/products', auth, checkPermission('products:create'), productValidation, restaurantController.createRestaurantProduct);
router.put('/products/:productId', auth, checkPermission('products:edit'), productValidation, restaurantController.updateRestaurantProduct);
router.delete('/:productId', auth, checkPermission('products:delete'), restaurantController.deleteRestaurantProduct);

// Rotas de Fornecedores (Suppliers)
router.get('/suppliers', auth, checkPermission('suppliers:view'), restaurantController.getRestaurantSuppliers);
router.post('/suppliers', auth, checkPermission('suppliers:create'), supplierValidation, restaurantController.createRestaurantSupplier);
router.put('/suppliers/:supplierId', auth, checkPermission('suppliers:edit'), supplierValidation, restaurantController.updateRestaurantSupplier);
router.delete('/suppliers/:supplierId', auth, checkPermission('suppliers:delete'), restaurantController.deleteRestaurantSupplier);

// Rotas de Mesas (Tables)
router.get('/tables', auth, checkPermission('tables:view'), restaurantController.getRestaurantTables);
router.post('/tables', auth, checkPermission('tables:create'), tableValidation, restaurantController.createRestaurantTable);
router.put('/tables/:tableId', auth, checkPermission('tables:edit'), tableValidation, restaurantController.updateRestaurantTable);
router.delete('/tables/:tableId', auth, checkPermission('tables:delete'), restaurantController.deleteRestaurantTable);

// Rotas de Fichas Técnicas (Technical Specifications)
router.get('/technical-specifications', auth, checkPermission('technicalSpecifications:view'), restaurantController.getRestaurantTechnicalSpecifications);
router.post('/technical-specifications', auth, checkPermission('technicalSpecifications:create'), technicalSpecificationValidation, restaurantController.createRestaurantTechnicalSpecification);
router.put('/technical-specifications/:technicalSpecificationId', auth, checkPermission('technicalSpecifications:edit'), technicalSpecificationValidation, restaurantController.updateRestaurantTechnicalSpecification);
router.delete('/technical-specifications/:technicalSpecificationId', auth, checkPermission('technicalSpecifications:delete'), restaurantController.deleteRestaurantTechnicalSpecification);

// Rotas de Garçom (Waiter/PDV)
router.post('/waiter/orders', auth, checkPermission('waiter:createOrder'), createWaiterOrderValidation, restaurantController.createWaiterOrder);
router.put('/waiter/orders/:orderId', auth, checkPermission('waiter:editOrder'), updateWaiterOrderValidation, restaurantController.updateWaiterOrder);
router.get('/waiter/orders/:orderId', auth, checkPermission('waiter:viewOrder'), restaurantController.getWaiterOrderById);
router.get('/waiter/orders', auth, checkPermission('waiter:viewOrder'), restaurantController.getWaiterOrders);
router.post('/waiter/calls', auth, checkPermission('waiter:createCall'), createWaiterCallValidation, restaurantController.createWaiterCall);
router.put('/waiter/calls/:callId', auth, checkPermission('waiter:editCall'), updateWaiterCallValidation, restaurantController.updateWaiterCall);
router.get('/waiter/calls', auth, checkPermission('waiter:viewCall'), restaurantController.getWaiterCalls);
router.get('/waiter/calls/:callId', auth, checkPermission('waiter:viewCall'), restaurantController.getWaiterCallById);
router.delete('/waiter/calls/:callId', auth, checkPermission('waiter:deleteCall'), restaurantController.deleteWaiterCall);


module.exports = router;