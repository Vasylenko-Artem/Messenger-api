import app from './app.js';
import { env } from './shared/config/env.js';
import { initSocket } from './socket/index.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

initSocket(server);

server.on('error', (err) => {
  console.error('Server error:', err);
});
