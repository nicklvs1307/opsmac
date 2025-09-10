const { NotFoundError, BadRequestError } = require('utils/errors');

module.exports = (db) => {
    const models = db;

    const generateQrCodeUrl = (restaurantSlug, tableNumber) => {
        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return `${frontendBaseUrl}/menu/${restaurantSlug}/${tableNumber}`;
    };

    const createTable = async (restaurant_id, table_number) => {
        const restaurant = await models.Restaurant.findByPk(restaurant_id);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado.');
        }

        const existingTable = await models.Table.findOne({
            where: { restaurant_id, table_number }
        });
        if (existingTable) {
            throw new BadRequestError('Table with this number already exists for this restaurant.');
        }

        const table = await models.Table.create({
            restaurant_id,
            table_number
        });

        const qr_code_url = generateQrCodeUrl(restaurant.slug, table.table_number);
        table.qr_code_url = qr_code_url;
        await table.save();

        return table;
    };

    const listTables = async (restaurant_id) => {
        const tables = await models.Table.findAll({
            where: { restaurant_id },
            order: [['table_number', 'ASC']]
        });
        return tables;
    };

    return {
        createTable,
        listTables,
    };
};