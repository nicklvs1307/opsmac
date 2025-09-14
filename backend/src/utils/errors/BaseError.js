class BaseError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates that this is an expected error
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = BaseError;
