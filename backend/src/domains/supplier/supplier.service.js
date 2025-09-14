const { BadRequestError, NotFoundError } = require("utils/errors");

module.exports = (db) => {
  const models = db;

  const createSupplier = async (
    name,
    contact_person,
    phone,
    email,
    address,
    restaurant_id,
  ) => {
    const supplier = await models.Supplier.create({
      name,
      contact_person,
      phone,
      email,
      address,
      restaurant_id,
    });
    return supplier;
  };

  const getAllSuppliers = async (restaurant_id) => {
    const suppliers = await models.Supplier.findAll({
      where: { restaurant_id },
    });
    return suppliers;
  };

  const getSupplierById = async (id) => {
    const supplier = await models.Supplier.findByPk(id);
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }
    return supplier;
  };

  const updateSupplier = async (
    id,
    name,
    contact_person,
    phone,
    email,
    address,
  ) => {
    const [updated] = await models.Supplier.update(
      { name, contact_person, phone, email, address },
      { where: { id } },
    );
    if (!updated) {
      throw new NotFoundError("Supplier not found");
    }
    const updatedSupplier = await models.Supplier.findByPk(id);
    return updatedSupplier;
  };

  const deleteSupplier = async (id) => {
    const deleted = await models.Supplier.destroy({ where: { id } });
    if (!deleted) {
      throw new NotFoundError("Supplier not found");
    }
  };

  return {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
  };
};
