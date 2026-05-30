import app from './app.js';
import { env } from './shared/config/env.js';
import { initSocket } from './socket/index.js';
import { logger } from './shared/logger/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});

initSocket(server);

server.on('error', (err) => {
  logger.error({ err }, 'Server error');
});
