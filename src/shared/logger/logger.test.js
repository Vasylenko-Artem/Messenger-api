const mockPino = jest.fn(() => ({
  info: jest.fn(),
}));

mockPino.stdTimeFunctions = {
  isoTime: jest.fn(),
};
mockPino.transport = jest.fn(() => 'transport');

jest.mock('pino', () => mockPino);

const originalEnv = process.env;

const importLogger = async (env) => {
  jest.resetModules();
  process.env = { ...originalEnv, ...env };

  return import('./logger.js');
};

describe('Logger', () => {
  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('creates plain logger for test environment and writes http messages', async () => {
    const { httpLoggerStream, logger } = await importLogger({
      NODE_ENV: 'test',
      LOG_LEVEL: undefined,
    });

    expect(mockPino.transport).not.toHaveBeenCalled();
    expect(mockPino).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'silent' })
    );

    httpLoggerStream.write('GET /health \n');

    expect(logger.info).toHaveBeenCalledWith({ source: 'http' }, 'GET /health');
  });

  it('creates plain logger for production environment', async () => {
    await importLogger({
      NODE_ENV: 'production',
      LOG_LEVEL: 'debug',
    });

    expect(mockPino.transport).not.toHaveBeenCalled();
    expect(mockPino).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'debug' })
    );
  });

  it('creates pretty and file transports outside test and production', async () => {
    await importLogger({
      NODE_ENV: 'development',
      LOG_LEVEL: '',
      LOG_FILE: 'custom.log',
    });

    expect(mockPino.transport).toHaveBeenCalledWith({
      targets: [
        {
          target: 'pino-pretty',
          level: 'info',
          options: { colorize: true },
        },
        {
          target: 'pino/file',
          level: 'info',
          options: {
            destination: 'custom.log',
            mkdir: true,
          },
        },
      ],
    });
    expect(mockPino).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'info' }),
      'transport'
    );
  });

  it('uses default log file when LOG_FILE is missing', async () => {
    await importLogger({
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      LOG_FILE: undefined,
    });

    expect(mockPino.transport).toHaveBeenCalledWith(
      expect.objectContaining({
        targets: expect.arrayContaining([
          expect.objectContaining({
            target: 'pino/file',
            options: expect.objectContaining({
              destination: 'logs/app.log',
            }),
          }),
        ]),
      })
    );
  });
});
