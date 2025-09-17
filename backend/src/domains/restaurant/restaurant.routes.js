import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js";
import {
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
  updateRestaurantValidation,
} from "./restaurant.validation.js";

import restaurantServiceFactory from "./restaurant.service.js";
import restaurantControllerFactory from "./restaurant.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

export default (db) => {
  const restaurantService = restaurantServiceFactory(db);
  const restaurantController = restaurantControllerFactory(restaurantService);
  const { auth } = authMiddleware(db);
  const router = express.Router();

  // Rotas para listar múltiplos restaurantes (para uso por superadmin ou sistemas internos)
  router.get(
    "/", // This will be /restaurants
    auth,
    requirePermission("restaurant_management", "read_all"), // A new permission for listing all
    asyncHandler(restaurantController.listRestaurants),
  );

  // Rotas de Gerenciamento de Restaurante
  router.get(
    "/",
    auth,
    requirePermission("restaurant_management", "read"),
    asyncHandler(restaurantController.getRestaurantById),
  );
  router.get(
    "/:restaurantId", // New route for getting by ID
    auth,
    requirePermission("restaurant_management", "read"), // Assuming same permission
    asyncHandler(restaurantController.getRestaurantById), // Reusing controller method
  );
  router.put(
    "/",
    auth,
    requirePermission("restaurant_management", "update"),
    ...updateRestaurantValidation,
    asyncHandler(restaurantController.updateRestaurant),
  ); // Added updateRestaurantValidation
  router.put(
    "/status/open",
    auth,
    requirePermission("restaurant_management", "update"),
    ...updateRestaurantStatusValidation,
    asyncHandler(restaurantController.updateRestaurantOpenStatus),
  );
  router.put(
    "/pos-status",
    auth,
    requirePermission("restaurant_management", "update"),
    ...updateRestaurantPosStatusValidation,
    asyncHandler(restaurantController.updateRestaurantPosStatus),
  );

  // Rotas de Usuários do Restaurante
  router.post(
    "/users",
    auth,
    requirePermission("restaurant_users", "create"),
    ...userValidation,
    asyncHandler(restaurantController.createRestaurantUser),
  );
  router.put(
    "/users/:userId",
    auth,
    requirePermission("restaurant_users", "update"),
    ...updateUserValidation,
    asyncHandler(restaurantController.updateRestaurantUser),
  );

  // Rotas de Adicionais (Addons)
  router.post(
    "/addons",
    auth,
    requirePermission("restaurant_addons", "create"),
    ...addonValidation,
    asyncHandler(restaurantController.createRestaurantAddon),
  );
  router.put(
    "/addons/:addonId",
    auth,
    requirePermission("restaurant_addons", "update"),
    ...addonValidation,
    asyncHandler(restaurantController.updateRestaurantAddon),
  );

  // Rotas de Categorias de Caixa (Cash Register Categories)
  router.post(
    "/cash-register-categories",
    auth,
    requirePermission("restaurant_cash_register_categories", "create"),
    ...cashRegisterCategoryValidation,
    asyncHandler(restaurantController.createRestaurantCashRegisterCategory),
  );
  router.put(
    "/cash-register-categories/:cashRegisterCategoryId",
    auth,
    requirePermission("restaurant_cash_register_categories", "update"),
    ...cashRegisterCategoryValidation,
    asyncHandler(restaurantController.updateRestaurantCashRegisterCategory),
  );

  // Rotas de Categorias (Categories)
  router.post(
    "/categories",
    auth,
    requirePermission("restaurant_categories", "create"),
    ...categoryValidation,
    asyncHandler(restaurantController.createRestaurantCategory),
  );
  router.put(
    "/categories/:categoryId",
    auth,
    requirePermission("restaurant_categories", "update"),
    ...categoryValidation,
    asyncHandler(restaurantController.updateRestaurantCategory),
  );

  // Rotas de Categorias Financeiras (Financial Categories)
  router.post(
    "/financial-categories",
    auth,
    requirePermission("restaurant_financial_categories", "create"),
    ...financialCategoryValidation,
    asyncHandler(restaurantController.createRestaurantFinancialCategory),
  );
  router.put(
    "/financial-categories/:financialCategoryId",
    auth,
    requirePermission("restaurant_financial_categories", "update"),
    ...financialCategoryValidation,
    asyncHandler(restaurantController.updateRestaurantFinancialCategory),
  );

  // Rotas de Ingredientes (Ingredients)
  router.post(
    "/ingredients",
    auth,
    requirePermission("restaurant_ingredients", "create"),
    ...ingredientValidation,
    asyncHandler(restaurantController.createRestaurantIngredient),
  );
  router.put(
    "/ingredients/:ingredientId",
    auth,
    requirePermission("restaurant_ingredients", "update"),
    ...ingredientValidation,
    asyncHandler(restaurantController.updateRestaurantIngredient),
  );

  // Rotas de Produtos (Products)
  router.post(
    "/products",
    auth,
    requirePermission("restaurant_products", "create"),
    ...productValidation,
    asyncHandler(restaurantController.createRestaurantProduct),
  );
  router.put(
    "/products/:productId",
    auth,
    requirePermission("restaurant_products", "update"),
    ...productValidation,
    asyncHandler(restaurantController.updateRestaurantProduct),
  );

  // Rotas de Fornecedores (Suppliers)
  router.post(
    "/suppliers",
    auth,
    requirePermission("restaurant_suppliers", "create"),
    ...supplierValidation,
    asyncHandler(restaurantController.createRestaurantSupplier),
  );
  router.put(
    "/suppliers/:supplierId",
    auth,
    requirePermission("restaurant_suppliers", "update"),
    ...supplierValidation,
    asyncHandler(restaurantController.updateRestaurantSupplier),
  );

  // Rotas de Mesas (Tables)
  router.post(
    "/tables",
    auth,
    requirePermission("restaurant_tables", "create"),
    ...tableValidation,
    asyncHandler(restaurantController.createRestaurantTable),
  );
  router.put(
    "/tables/:tableId",
    auth,
    requirePermission("restaurant_tables", "update"),
    ...tableValidation,
    asyncHandler(restaurantController.updateRestaurantTable),
  );

  // Rotas de Fichas Técnicas (Technical Specifications)
  router.post(
    "/technical-specifications",
    auth,
    requirePermission("restaurant_technical_specifications", "create"),
    ...technicalSpecificationValidation,
    asyncHandler(restaurantController.createRestaurantTechnicalSpecification),
  );
  router.put(
    "/technical-specifications/:technicalSpecificationId",
    auth,
    requirePermission("restaurant_technical_specifications", "update"),
    ...technicalSpecificationValidation,
    asyncHandler(restaurantController.updateRestaurantTechnicalSpecification),
  );

  // Rotas de Garçom (Waiter/PDV)
  router.post(
    "/waiter/orders",
    auth,
    requirePermission("waiter_orders", "create"),
    createWaiterOrderValidation,
    asyncHandler(restaurantController.createWaiterOrder),
  );
  router.put(
    "/waiter/orders/:orderId",
    auth,
    requirePermission("waiter_orders", "update"),
    updateWaiterOrderValidation,
    asyncHandler(restaurantController.updateWaiterOrder),
  );
  router.get(
    "/waiter/orders/:orderId",
    auth,
    requirePermission("waiter_orders", "read"),
    asyncHandler(restaurantController.getWaiterOrderById),
  );
  router.get(
    "/waiter/orders",
    auth,
    requirePermission("waiter_orders", "read"),
    asyncHandler(restaurantController.getWaiterOrders),
  );
  router.post(
    "/waiter/calls",
    auth,
    requirePermission("waiter_calls", "create"),
    createWaiterCallValidation,
    asyncHandler(restaurantController.createWaiterCall),
  );
  router.put(
    "/waiter/calls/:callId",
    auth,
    requirePermission("waiter_calls", "update"),
    updateWaiterCallValidation,
    asyncHandler(restaurantController.updateWaiterCall),
  );
  router.get(
    "/waiter/calls",
    auth,
    requirePermission("waiter_calls", "read"),
    asyncHandler(restaurantController.getWaiterCalls),
  );
  router.get(
    "/waiter/calls/:callId",
    auth,
    requirePermission("waiter_calls", "read"),
    asyncHandler(restaurantController.getWaiterCallById),
  );
  router.delete(
    "/waiter/calls/:callId",
    auth,
    requirePermission("waiter_calls", "delete"),
    asyncHandler(restaurantController.deleteWaiterCall),
  );

  return router;
};
