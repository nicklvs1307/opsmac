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
  let secret;
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('JWT_SECRET_FILE:', process.env.JWT_SECRET_FILE);

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET_FILE) {
    try {
      secret = fs.readFileSync(process.env.JWT_SECRET_FILE, 'utf8').trim();
      console.log('Secret read from file. Length:', secret.length);
      if (secret.length === 0) {
        console.error('Secret read from file is an empty string after trim!');
      }
    } catch (error) {
      console.error('Error reading JWT secret file:', error);
      throw new Error('Erro ao ler o segredo JWT do arquivo.');
    }
  } else if (process.env.JWT_SECRET) {
    secret = process.env.JWT_SECRET;
    console.log('Secret read from env. Length:', secret.length);
  } else {
    throw new Error('JWT_SECRET não está definido no .env ou no arquivo de segredo.');
  }

  if (!secret) {
    console.error('Final secret is empty or undefined!');
    throw new Error('JWT_SECRET não está definido.');
  }
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
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
