const { models } = require('config/database');

const apiAuth = async (req, res, next) => {
  const apiToken = req.header('x-api-key');

  if (!apiToken) {
    return res.status(401).json({ msg: 'Nenhum token de API fornecido, autorização negada' });
  }

  try {
    const restaurant = await models.Restaurant.findOne({ where: { api_token: apiToken } });

    if (!restaurant) {
      return res.status(401).json({ msg: 'Token de API inválido' });
    }

    req.restaurant = restaurant; // Anexa o objeto do restaurante à requisição
    next();
  } catch (err) {
    console.error('Erro no middleware de autenticação de API:', err);
    res.status(500).json({ msg: 'Erro do servidor' });
  }
};

module.exports = apiAuth;
