module.exports = (db) => {
    const models = db.models;

    const getRestaurantSettings = async (restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        return restaurant.settings || {};
    };

    const updateRestaurantSettings = async (restaurantId, settings) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        const updatedSettings = lodash.merge({}, restaurant.settings, settings);
        await restaurant.update({ settings: updatedSettings });
        return updatedSettings;
    };

    const uploadRestaurantLogo = async (restaurantId, filename) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        const logoUrl = `/uploads/${filename}`;
        await restaurant.update({ logo: logoUrl });
        return logoUrl;
    };

    const getApiToken = async (restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        return restaurant.api_token;
    };

    const generateApiToken = async (restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        const newApiToken = crypto.randomBytes(32).toString('hex');
        await restaurant.update({ api_token: newApiToken });
        return newApiToken;
    };

    const revokeApiToken = async (restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        await restaurant.update({ api_token: null });
    };

    const getWhatsappSettings = async (restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        return {
            whatsapp_enabled: restaurant.whatsapp_enabled,
            whatsapp_api_url: restaurant.whatsapp_api_url,
            whatsapp_api_key: restaurant.whatsapp_api_key,
            whatsapp_instance_id: restaurant.whatsapp_instance_id,
            whatsapp_phone_number: restaurant.whatsapp_phone_number,
        };
    };

    const updateWhatsappSettings = async (restaurantId, settingsData) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        await restaurant.update(settingsData);
    };

    const testWhatsappMessage = async (restaurantId, recipient, message) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
    };

    const updateRestaurantProfile = async (restaurantId, profileData) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        await restaurant.update(profileData);
        return restaurant;
    };

    const getNpsCriteria = async (restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId, {
            attributes: ['npsCriteriaScores']
        });
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        return restaurant.npsCriteriaScores || [];
    };

    const updateNpsCriteria = async (restaurantId, nps_criteria) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        await restaurant.update({ npsCriteriaScores: nps_criteria });
        return nps_criteria;
    };

    return {
        getRestaurantSettings,
        updateRestaurantSettings,
        uploadRestaurantLogo,
        getApiToken,
        generateApiToken,
        revokeApiToken,
        getWhatsappSettings,
        updateWhatsappSettings,
        testWhatsappMessage,
        updateRestaurantProfile,
        getNpsCriteria,
        updateNpsCriteria,
    };
};