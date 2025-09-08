const suppliersService = require('./supplier.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.createSupplier = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const { name, contact_person, phone, email, address } = req.body;
    const supplier = await suppliersService.createSupplier(name, contact_person, phone, email, address, restaurantId);
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

exports.getAllSuppliers = async (req, res, next) => {
  try {
    const restaurantId = req.context.restaurantId;
    const suppliers = await suppliersService.getAllSuppliers(restaurantId);
    res.status(200).json(suppliers);
  } catch (error) {
    next(error);
  }
};

exports.getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await suppliersService.getSupplierById(id);
    res.status(200).json(supplier);
  } catch (error) {
    next(error);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { id } = req.params;
    const { name, contact_person, phone, email, address } = req.body;
    const updatedSupplier = await suppliersService.updateSupplier(id, name, contact_person, phone, email, address);
    res.status(200).json(updatedSupplier);
  } catch (error) {
    next(error);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    await suppliersService.deleteSupplier(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
