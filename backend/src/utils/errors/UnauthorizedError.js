const ApiError = require('./ApiError');

class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401);
    this.name = 'UnauthorizedError';
    this.details = details;
  }
}

module.exports = UnauthorizedError;