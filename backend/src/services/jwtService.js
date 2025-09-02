const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Gera um token JWT para um ID de usuário.
 * @param {string} userId - O ID do usuário a ser incluído no token.
 * @returns {string} O token JWT gerado.
 */
const fs = require('fs');
const { UnauthorizedError } = require('utils/errors');

const generateToken = (userId) => {
  const secret = 'thisisatestsecretthatislongenough12345'; // TEMPORARY HARDCODED SECRET
  console.log('Using hardcoded secret. Length:', secret.length);
    throw new Error('JWT_SECRET não está definido.');
  }
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verifica um token JWT e retorna o payload decodificado.
 * @param {string} token - O token JWT a ser verificado.
 * @returns {object} O payload decodificado do token.
 */
const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não está definido no .env');
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Retorna null ou lança um erro específico se a verificação falhar
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
