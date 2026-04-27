import { authModule } from './modules/auth/auth.module.js';
import { messageModule } from './modules/messages/message.module.js';
import { conversationsModule } from './modules/conversations/conversations.module.js';
import { usersModule } from './modules/users/users.module.js';

export const registerModules = (app) => {
  app.use('/auth', authModule.router);
  app.use('/messages', messageModule.router);
  app.use('/conversations', conversationsModule.router);
  app.use('/users', usersModule.router);
};
