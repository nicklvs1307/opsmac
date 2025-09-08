const { google } = require('googleapis');
const { BadRequestError, NotFoundError, ForbiddenError } = require('utils/errors');

const OAuth2 = google.auth.OAuth2;

module.exports = (db) => {
    const models = db.models;

    const initializeOAuthClient = async (restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado.');
        }

        const oauth2Client = new OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        if (restaurant.gmb_access_token && restaurant.gmb_refresh_token) {
            oauth2Client.setCredentials({
                access_token: restaurant.gmb_access_token,
                refresh_token: restaurant.gmb_refresh_token,
            });
        }

        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                await restaurant.update({
                    gmb_access_token: tokens.access_token,
                    gmb_refresh_token: tokens.refresh_token,
                });
            } else {
                await restaurant.update({
                    gmb_access_token: tokens.access_token,
                });
            }
        });

        return oauth2Client;
    };

    const getAuthUrlInternal = async (restaurantId) => {
        const oauth2Client = await initializeOAuthClient(restaurantId);
        const scopes = ['https://www.googleapis.com/auth/business.manage'];
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
            state: restaurantId,
        });
    };

    const processOAuth2CallbackInternal = async (restaurantId, code) => {
        const oauth2Client = await initializeOAuthClient(restaurantId);
        const { tokens } = await oauth2Client.getToken(code);

        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado para salvar tokens.');
        }

        await restaurant.update({
            gmb_access_token: tokens.access_token,
            gmb_refresh_token: tokens.refresh_token,
        });
    };

    const getLocationsInternal = async (restaurantId) => {
        const oauth2Client = await initializeOAuthClient(restaurantId);
        const mybusiness = google.mybusinessaccountmanagement({
            version: 'v1',
            auth: oauth2Client,
        });

        const res = await mybusiness.accounts.list();
        const account = res.data.accounts[0];
        if (!account) {
            throw new NotFoundError('Nenhuma conta do Google My Business encontrada.');
        }

        const locationsRes = await mybusiness.accounts.locations.list({
            parent: account.name,
        });
        return locationsRes.data.locations || [];
    };

    const getReviewsInternal = async (restaurantId, locationName) => {
        const oauth2Client = await initializeOAuthClient(restaurantId);
        const mybusiness = google.mybusinessreviews({
            version: 'v1',
            auth: oauth2Client,
        });

        const res = await mybusiness.locations.reviews.list({
            parent: locationName,
        });
        return res.data.reviews || [];
    };

    const replyToReviewInternal = async (restaurantId, reviewName, comment) => {
        const oauth2Client = await initializeOAuthClient(restaurantId);
        const mybusiness = google.mybusinessreviews({
            version: 'v1',
            auth: oauth2Client,
        });

        const res = await mybusiness.locations.reviews.updateAnswer({
            name: reviewName,
            requestBody: {
                comment: comment,
            },
        });
        return res.data;
    };

    const checkGMBModuleEnabled = async (restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant || !restaurant.settings?.enabled_modules?.includes('google_my_business_integration')) {
            throw new ForbiddenError('Módulo Google My Business não habilitado para este restaurante.');
        }
        return restaurant;
    };

    const getAuthUrl = async (restaurantId) => {
        return getAuthUrlInternal(restaurantId);
    };

    const oauth2Callback = async (code, state) => {
        if (!code) {
            throw new BadRequestError('Código de autorização não fornecido.');
        }
        if (!state) {
            throw new BadRequestError('State (ID do restaurante) não fornecido.');
        }

        await processOAuth2CallbackInternal(state, code);
        return process.env.FRONTEND_URL + '/integrations?status=success&integration=google-my_business';
    };

    const getLocations = async (restaurantId) => {
        return getLocationsInternal(restaurantId);
    };

    const getReviews = async (restaurantId, locationName) => {
        return getReviewsInternal(restaurantId, `locations/${locationName}`);
    };

    const replyToReview = async (restaurantId, locationName, reviewName, comment) => {
        if (!comment) {
            throw new BadRequestError('Comentário da resposta é obrigatório.');
        }
        return replyToReviewInternal(restaurantId, `locations/${locationName}/reviews/${reviewName}`, comment);
    };

    return {
        checkGMBModuleEnabled,
        getAuthUrl,
        oauth2Callback,
        getLocations,
        getReviews,
        replyToReview,
    };
};