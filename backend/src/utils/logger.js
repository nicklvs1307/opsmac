const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, align } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        align(),
        logFormat
      )
    }),
    // Optionally, add file transports for production
    // new transports.File({ filename: 'error.log', level: 'error' }),
    // new transports.File({ filename: 'combined.log' })
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

module.exports = logger;