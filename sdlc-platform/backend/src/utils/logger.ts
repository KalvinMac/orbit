import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, align } = winston.format;

const logFormat = printf(({ level, message, timestamp: logTimestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `[${logTimestamp}] ${level}: ${message}${metaString}`;
});

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'sdlc-platform' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
    }),
    // Write all logs with level `info` and below to `combined.log`
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        align(),
        logFormat
      ),
    })
  );
}

export { logger };
