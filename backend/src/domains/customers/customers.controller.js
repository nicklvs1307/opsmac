import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";
import { validationResult } from "express-validator";

import customerServiceFactory from "./customers.service.js";

export default (db) => {
  const customerService = customerServiceFactory(db);

  class CustomersController {
    constructor() {
      // Bind methods to the instance to ensure 'this' context is correct when used as Express middleware
      this.getCustomerDashboardMetrics =
        this.getCustomerDashboardMetrics.bind(this);
      this.getBirthdayCustomers = this.getBirthdayCustomers.bind(this);
      this.listCustomers = this.listCustomers.bind(this);
      this.createCustomer = this.createCustomer.bind(this);
      this.getCustomerByPhone = this.getCustomerByPhone.bind(this);
      this.getCustomerById = this.getCustomerById.bind(this);
      this.updateCustomer = this.updateCustomer.bind(this);
      this.deleteCustomer = this.deleteCustomer.bind(this);
      this.getCustomerDetails = this.getCustomerDetails.bind(this);
      this.resetCustomerVisits = this.resetCustomerVisits.bind(this);
      this.clearCustomerCheckins = this.clearCustomerCheckins.bind(this);
      this.publicRegisterCustomer = this.publicRegisterCustomer.bind(this);
    }

    _handleValidationErrors(req) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new BadRequestError("Dados inválidos", errors.array());
      }
    }

    async getCustomerDashboardMetrics(req, res, next) {
        const restaurantId = req.context.restaurantId;
        const metrics =
          await customerService.getCustomerDashboardMetrics(restaurantId);
        res.json(metrics);
    }

    async getBirthdayCustomers(req, res, next) {
        const restaurantId = req.context.restaurantId;
        const customers =
          await customerService.getBirthdayCustomers(restaurantId);
        res.json(customers);
    }

    async listCustomers(req, res, next) {
        this._handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const { count, rows } = await customerService.listCustomers(
          restaurantId,
          req.query,
        );
        res.json({
          customers: rows,
          totalPages: Math.ceil(count / (req.query.limit || 10)),
          currentPage: parseInt(req.query.page || 1),
          totalCustomers: count,
        });
    }

    async createCustomer(req, res, next) {
        this._handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const customer = await customerService.createCustomer(
          restaurantId,
          req.body,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "CUSTOMER_CREATED",
          `Customer:${customer.id}`,
          { name: customer.name, email: customer.email },
        );
        res.status(201).json(customer);
    }

    async getCustomerByPhone(req, res, next) {
        this._handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const customer = await customerService.getCustomerByPhone(
          restaurantId,
          req.query.phone,
        );
        res.json(customer);
    }

    async getCustomerById(req, res, next) {
        const restaurantId = req.context.restaurantId;
        const customer = await customerService.getCustomerById(
          restaurantId,
          req.params.id,
        );
        res.json(customer);
    }

    async updateCustomer(req, res, next) {
        this._handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const customer = await customerService.updateCustomer(
          restaurantId,
          req.params.id,
          req.body,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "CUSTOMER_UPDATED",
          `Customer:${customer.id}`,
          { updatedData: req.body },
        );
        res.json(customer);
    }

    async deleteCustomer(req, res, next) {
        const restaurantId = req.context.restaurantId;
        await customerService.deleteCustomer(restaurantId, req.params.id);
        await auditService.log(
          req.user,
          restaurantId,
          "CUSTOMER_DELETED",
          `Customer:${req.params.id}`,
          {},
        );
        res.status(200).json({ message: "Cliente excluído com sucesso." });
    }

    async getCustomerDetails(req, res, next) {
        const restaurantId = req.context.restaurantId;
        const details = await customerService.getCustomerDetails(
          restaurantId,
          req.params.id,
        );
        res.json(details);
    }

    async resetCustomerVisits(req, res, next) {
        const restaurantId = req.context.restaurantId;
        const customer = await customerService.resetCustomerVisits(
          restaurantId,
          req.params.id,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "CUSTOMER_VISITS_RESET",
          `Customer:${customer.id}`,
          {},
        );
        res.json({
          message: "Visitas do cliente resetadas com sucesso.",
          customer,
        });
    }

    async clearCustomerCheckins(req, res, next) {
        const restaurantId = req.context.restaurantId;
        await customerService.clearCustomerCheckins(
          restaurantId,
          req.params.id,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "CUSTOMER_CHECKINS_CLEARED",
          `Customer:${req.params.id}`,
          {},
        );
        res.json({ message: "Check-ins do cliente limpos com sucesso." });
    }

    async publicRegisterCustomer(req, res, next) {
        this._handleValidationErrors(req);
        const result = await customerService.publicRegisterCustomer(req.body);
        await auditService.log(
          null,
          result.restaurantId,
          "PUBLIC_CUSTOMER_REGISTERED",
          `Customer:${result.customer.id}`,
          { name: result.customer.name, email: result.customer.email },
        );
        res.status(result.status || 201).json(result);
    }
  }

  return new CustomersController();
};