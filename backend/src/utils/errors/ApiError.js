const BaseError = require('./BaseError');

class ApiError extends BaseError {
  constructor(message, statusCode = 500) {
    super(message, statusCode);
  }
}

module.exports = ApiError;