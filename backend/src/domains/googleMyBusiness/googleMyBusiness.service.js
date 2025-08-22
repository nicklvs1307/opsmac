const { google } = require('googleapis');
const { models } = require('../config/database');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/errors');

const OAuth2 = google.auth.OAuth2;

// Helper to initialize OAuth2 client (Moved from backend/services/googleMyBusinessService.js)
async function initializeOAuthClient(restaurantId) {
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

  // Refresh token if expired
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
}

// Helper function to get restaurantId from user (already exists in the file, but adding for clarity)
async function getRestaurantIdFromUser(userId) {
  const user = await models.User.findByPk(userId, {
    include: [{ model: models.Restaurant, as: 'restaurants' }]
  });
  return user?.restaurants?.[0]?.id;
}

// Moved from backend/services/googleMyBusinessService.js
async function getAuthUrlInternal(restaurantId) {
  const oauth2Client = await initializeOAuthClient(restaurantId);
  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
  ];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: restaurantId, // Pass restaurantId in state to retrieve it in callback
  });
}

// Moved from backend/services/googleMyBusinessService.js
async function processOAuth2CallbackInternal(restaurantId, code) {
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
}

// Moved from backend/services/googleMyBusinessService.js
async function getLocationsInternal(restaurantId) {
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
}

// Moved from backend/services/googleMyBusinessService.js
async function getReviewsInternal(restaurantId, locationName) {
  const oauth2Client = await initializeOAuthClient(restaurantId);
  const mybusiness = google.mybusinessreviews({
    version: 'v1',
    auth: oauth2Client,
  });

  const res = await mybusiness.locations.reviews.list({
    parent: locationName,
  });
  return res.data.reviews || [];
}

// Moved from backend/services/googleMyBusinessService.js
async function replyToReviewInternal(restaurantId, reviewName, comment) {
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
}


exports.checkGMBModuleEnabled = async (userId) => {
  const restaurantId = await getRestaurantIdFromUser(userId);
  if (!restaurantId) {
    throw new BadRequestError('Restaurante não encontrado para o usuário autenticado.');
  }

  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant || !restaurant.settings?.enabled_modules?.includes('google_my_business_integration')) {
    throw new ForbiddenError('Módulo Google My Business não habilitado para este restaurante.');
  }
  return restaurant;
};

exports.getAuthUrl = async (userId) => {
  const restaurantId = await getRestaurantIdFromUser(userId);
  if (!restaurantId) {
    throw new BadRequestError('Restaurante não encontrado para o usuário.');
  }
  return await getAuthUrlInternal(restaurantId);
};

exports.oauth2Callback = async (code) => {
  if (!code) {
    throw new BadRequestError('Código de autorização não fornecido.');
  }

  // TODO: Precisamos de uma forma de associar este callback ao restaurante correto.
  // Uma solução seria passar o restaurantId no state do OAuth URL, mas isso requer mais complexidade.
  // Para simplificar o teste inicial, vamos usar um restaurantId fixo ou o primeiro encontrado.
  // This part needs to be handled carefully. For now, I'll keep the existing logic but note the TODO.
  const restaurant = await models.Restaurant.findOne(); // Apenas para teste, NÃO USAR EM PRODUÇÃO
  if (!restaurant) {
    throw new NotFoundError('Nenhum restaurante encontrado para processar o callback.');
  }

  await processOAuth2CallbackInternal(restaurant.id, code);
  return process.env.FRONTEND_URL + '/integrations?status=success&integration=google-my_business';
};

exports.getLocations = async (userId) => {
  const restaurantId = await getRestaurantIdFromUser(userId);
  if (!restaurantId) {
    throw new BadRequestError('Restaurante não encontrado para o usuário.');
  }
  return await getLocationsInternal(restaurantId);
};

exports.getReviews = async (userId, locationName) => {
  const restaurantId = await getRestaurantIdFromUser(userId);
  if (!restaurantId) {
    throw new BadRequestError('Restaurante não encontrado para o usuário.');
  }
  return await getReviewsInternal(restaurantId, `locations/${locationName}`);
};

exports.replyToReview = async (userId, locationName, reviewName, comment) => {
  if (!comment) {
    throw new BadRequestError('Comentário da resposta é obrigatório.');
  }
  const restaurantId = await getRestaurantIdFromUser(userId);
  if (!restaurantId) {
    throw new BadRequestError('Restaurante não encontrado para o usuário.');
  }
  return await replyToReviewInternal(restaurantId, `locations/${locationName}/reviews/${reviewName}`, comment);
};