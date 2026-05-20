import pino from 'pino';

export const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const httpLoggerStream = {
  write: (message) => {
    logger.info({ source: 'http' }, message.trim());
  },
};
