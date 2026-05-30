import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const logLevel = process.env.LOG_LEVEL || (isTest ? 'silent' : 'info');

const loggerOptions = {
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
};

const createLogger = () => {
  if (isProduction || isTest) {
    return pino(loggerOptions);
  }

  const transport = pino.transport({
    targets: [
      {
        target: 'pino-pretty',
        level: logLevel,
        options: { colorize: true },
      },
      {
        target: 'pino/file',
        level: logLevel,
        options: {
          destination: process.env.LOG_FILE || 'logs/app.log',
          mkdir: true,
        },
      },
    ],
  });

  return pino(loggerOptions, transport);
};

export const logger = createLogger();

export const httpLoggerStream = {
  write: (message) => {
    logger.info({ source: 'http' }, message.trim());
  },
};
