const { models } = require('../../config/database');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

exports.createSupplier = async (name, contact_person, phone, email, address, restaurant_id) => {
  const supplier = await models.Supplier.create({ name, contact_person, phone, email, address, restaurant_id });
  return supplier;
};

exports.getAllSuppliers = async (restaurant_id) => {
  const suppliers = await models.Supplier.findAll({ where: { restaurant_id } });
  return suppliers;
};

exports.getSupplierById = async (id) => {
  const supplier = await models.Supplier.findByPk(id);
  if (!supplier) {
    throw new NotFoundError('Supplier not found');
  }
  return supplier;
};

exports.updateSupplier = async (id, name, contact_person, phone, email, address) => {
  const [updated] = await models.Supplier.update({ name, contact_person, phone, email, address }, { where: { id } });
  if (!updated) {
    throw new NotFoundError('Supplier not found');
  }
  const updatedSupplier = await models.Supplier.findByPk(id);
  return updatedSupplier;
};

exports.deleteSupplier = async (id) => {
  const deleted = await models.Supplier.destroy({ where: { id } });
  if (!deleted) {
    throw new NotFoundError('Supplier not found');
  }
};