export class BaseError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends BaseError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

export class PaymentRequiredError extends BaseError {
  constructor(message = "Payment Required") {
    super(message, 402);
  }
}