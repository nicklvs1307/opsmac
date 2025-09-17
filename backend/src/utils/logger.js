import winston from "winston";

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, align, errors } = format;

// Custom format to handle error stacks
const logFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    // When an error object is logged, the stack property will be available
    return `${timestamp} [${level}]: ${message}\n${stack}`;
  }
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // This is crucial to get the stack trace
    logFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), align(), logFormat),
    }),
    // You can still add file transports if needed
    // new transports.File({ filename: 'error.log', level: 'error' }),
    // new transports.File({ filename: 'combined.log' })
  ],
  exitOnError: false,
});

export default logger;
