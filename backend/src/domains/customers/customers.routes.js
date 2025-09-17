import safeRouter from "../../utils/safeRouter.js";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js";

import CustomersControllerFactory from "./customers.controller.js";
import {
  createCustomerValidation,
  updateCustomerValidation,
  guestRegisterCustomerValidation,
  customerQueryValidation,
  byPhoneValidation,
} from "./customers.validation.js";

export default (db) => {
  const customersController = CustomersControllerFactory(db);
  const router = safeRouter();

  /**
   * @swagger
   * /customers/public/register:
   *   post:
   *     summary: Register a new customer publicly (e.g., via QR code)
   *     tags: [Customers]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - phone
   *               - restaurantId
   *             properties:
   *               name:
   *                 type: string
   *               phone:
   *                 type: string
   *               birthDate:
   *                 type: string
   *                 format: date
   *               restaurantId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Customer registered successfully
   *       200:
   *         description: Customer updated successfully (if phone/restaurantId already exists)
   *       400:
   *         description: Invalid data
   */
  router.post(
    "/guest-register",
    ...publicRegisterCustomerValidation,
    asyncHandler(customersController.publicRegisterCustomer),
  );

  /**
   * @swagger
   * /customers/dashboard-metrics:
   *   get:
   *     summary: Get customer-related dashboard metrics for a restaurant
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Customer dashboard metrics
   */
  router.get(
    "/dashboard-metrics",
    requirePermission("fidelity:relationship:customers", "read"),
    asyncHandler(customersController.getCustomerDashboardMetrics),
  );

  /**
   * @swagger
   * /customers/birthdays:
   *   get:
   *     summary: Get customers with birthdays today for a restaurant
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of customers with birthdays today
   */
  router.get(
    "/birthdays",
    requirePermission("fidelity:relationship:customers", "read"),
    asyncHandler(customersController.getBirthdayCustomers),
  );

  /**
   * @swagger
   * /customers/restaurant/{restaurantId}:
   *   get:
   *     summary: List customers for a specific restaurant
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: restaurantId
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *         description: ID of the restaurant
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: segment
   *         schema:
   *           type: string
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of customers
   */
  router.get(
    "/restaurant/:restaurantId",
    requirePermission("fidelity:relationship:customers", "read"),
    asyncHandler(customersController.listCustomers),
  );

  /**
   * @swagger
   * /customers:
   *   get:
   *     summary: List customers for the authenticated user's restaurant
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: segment
   *         schema:
   *           type: string
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of customers
   */
  router.get(
    "/",
    requirePermission("fidelity:relationship:customers", "read"),
    ...customerQueryValidation,
    asyncHandler(customersController.listCustomers),
  );

  /**
   * @swagger
   * /customers:
   *   post:
   *     summary: Create a new customer
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               phone:
   *                 type: string
   *               birthDate:
   *                 type: string
   *                 format: date
   *               cpf:
   *                 type: string
   *               gender:
   *                 type: string
   *               zipCode:
   *                 type: string
   *               address:
   *                 type: string
   *               city:
   *                 type: string
   *               state:
   *                 type: string
   *               country:
   *                 type: string
   *     responses:
   *       201:
   *         description: Customer created successfully
   *       400:
   *         description: Invalid data
   */
  router.post(
    "/",
    requirePermission("fidelity:relationship:customers", "create"),
    ...createCustomerValidation,
    asyncHandler(customersController.createCustomer),
  );

  /**
   * @swagger
   * /customers/by-phone:
   *   get:
   *     summary: Get customer by phone number
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: phone
   *         schema:
   *           type: string
   *         required: true
   *         description: Customer's phone number
   *     responses:
   *       200:
   *         description: Customer data
   *       404:
   *         description: Customer not found
   */
  router.get(
    "/by-phone",
    requirePermission("fidelity:relationship:customers", "read"),
    ...byPhoneValidation,
    asyncHandler(customersController.getCustomerByPhone),
  );

  /**
   * @swagger
   * /customers/{id}:
   *   get:
   *     summary: Get customer by ID
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *         description: Customer ID
   *     responses:
   *       200:
   *         description: Customer data
   *       404:
   *         description: Customer not found
   */
  router.get(
    "/:id",
    requirePermission("fidelity:relationship:customers", "read"),
    asyncHandler(customersController.getCustomerById),
  );

  /**
   * @swagger
   * /customers/{id}:
   *   put:
   *     summary: Update customer by ID
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *         description: Customer ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               phone:
   *                 type: string
   *               birthDate:
   *                 type: string
   *                 format: date
   *               cpf:
   *                 type: string
   *               gender:
   *                 type: string
   *               zipCode:
   *                 type: string
   *               address:
   *                 type: string
   *               city:
   *                 type: string
   *               state:
   *                 type: string
   *               country:
   *                 type: string
   *     responses:
   *       200:
   *         description: Customer updated successfully
   *       400:
   *         description: Invalid data
   *       404:
   *         description: Customer not found
   */
  router.put(
    "/:id",
    requirePermission("fidelity:relationship:customers", "update"),
    ...updateCustomerValidation,
    asyncHandler(customersController.updateCustomer),
  );

  /**
   * @swagger
   * /customers/{id}:
   *   delete:
   *     summary: Delete customer by ID
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *         description: Customer ID
   *     responses:
   *       200:
   *         description: Customer deleted successfully
   *       404:
   *         description: Customer not found
   */
  router.delete(
    "/:id",
    requirePermission("fidelity:relationship:customers", "delete"),
    asyncHandler(customersController.deleteCustomer),
  );

  /**
   * @swagger
   * /customers/{id}/details:
   *   get:
   *     summary: Get detailed customer information by ID
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *         description: Customer ID
   *     responses:
   *       200:
   *         description: Detailed customer data
   *       404:
   *         description: Customer not found
   */
  router.get(
    "/:id/details",
    requirePermission("fidelity:relationship:customers", "read"),
    asyncHandler(customersController.getCustomerDetails),
  );

  /**
   * @swagger
   * /customers/{id}/reset-visits:
   *   post:
   *     summary: Reset a customer's total visits to 0
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *         description: Customer ID
   *     responses:
   *       200:
   *         description: Customer visits reset successfully
   *       404:
   *         description: Customer not found
   */
  router.post(
    "/:id/reset-visits",
    requirePermission("fidelity:relationship:customers", "update"),
    asyncHandler(customersController.resetCustomerVisits),
  );

  /**
   * @swagger
   * /customers/{id}/clear-checkins:
   *   post:
   *     summary: Clear all check-ins for a customer
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *         description: Customer ID
   *     responses:
   *       200:
   *         description: Customer check-ins cleared successfully
   *       404:
   *         description: Customer not found
   */
  router.post(
    "/:id/clear-checkins",
    requirePermission("fidelity:relationship:customers", "update"),
    asyncHandler(customersController.clearCustomerCheckins),
  );

  return router;
};
