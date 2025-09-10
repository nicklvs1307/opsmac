module.exports = (suppliersService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');
  const auditService = require('../../services/auditService'); // Import auditService

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const createSupplier = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const { name, contact_person, phone, email, address } = req.body;
    const supplier = await suppliersService.createSupplier(name, contact_person, phone, email, address, restaurantId);
    res.status(201).json(supplier);
  };

  const getAllSuppliers = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const suppliers = await suppliersService.getAllSuppliers(restaurantId);
    res.status(200).json(suppliers);
  };

  const getSupplierById = async (req, res, next) => {
    const { id } = req.params;
    const supplier = await suppliersService.getSupplierById(id);
    res.status(200).json(supplier);
  };

  const updateSupplier = async (req, res, next) => {
    handleValidationErrors(req);
    const { id } = req.params;
    const { name, contact_person, phone, email, address } = req.body;
    const updatedSupplier = await suppliersService.updateSupplier(id, name, contact_person, phone, email, address);
    res.status(200).json(updatedSupplier);
  };

  const deleteSupplier = async (req, res, next) => {
    const { id } = req.params;
    await suppliersService.deleteSupplier(id);
    res.status(204).send();
  };

  return {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
  };
};