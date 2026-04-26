import { authModule } from './modules/auth/auth.module.js';
import { messageModule } from './modules/messages/message.module.js';

export const registerModules = (app) => {
  app.use('/auth', authModule.router);
  app.use('/messages', messageModule.router);
};
