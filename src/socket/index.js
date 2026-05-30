import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import { env } from '../shared/config/env.js';
import { badRequest, unauthorized } from '../shared/errors/http-error.js';
import { logger } from '../shared/logger/logger.js';
import * as messagesService from '../modules/messages/message.service.js';
import { getConversationRoom, SOCKET_EVENTS } from './events.js';

let io;

const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const separatorIndex = cookie.indexOf('=');

    if (separatorIndex === -1) {
      return cookies;
    }

    const key = cookie.slice(0, separatorIndex).trim();
    const value = cookie.slice(separatorIndex + 1).trim();

    if (key) {
      cookies[key] = decodeURIComponent(value);
    }

    return cookies;
  }, {});
};

const getSocketToken = (socket) => {
  const authToken = socket.handshake.auth?.token;

  if (authToken) {
    return authToken;
  }

  return parseCookies(socket.handshake.headers.cookie).accessToken;
};

const authenticateSocket = (socket, next) => {
  // console.log('HANDSHAKE AUTH:', socket.handshake.auth);
  // console.log('HANDSHAKE HEADERS:', socket.handshake.headers);

  logger.info(
    { socketId: socket.id, auth: socket.handshake.auth },
    'Authenticating socket'
  );

  const token = getSocketToken(socket);

  if (!token) {
    return next(unauthorized('No token'));
  }

  try {
    socket.user = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return next();
  } catch {
    return next(unauthorized('Invalid token'));
  }
};

const runSocketAction = async (socket, action, callback) => {
  try {
    const result = await action();

    if (typeof callback === 'function') {
      callback({ ok: true, data: result });
    }
  } catch (error) {
    if (typeof callback === 'function') {
      callback({ ok: false, message: error.message });
      return;
    }

    socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
  }
};

const registerConversationHandlers = (socket) => {
  socket.on(
    SOCKET_EVENTS.CONVERSATION_JOIN,
    ({ conversationId } = {}, callback) =>
      runSocketAction(
        socket,
        async () => {
          if (!conversationId) {
            throw badRequest('Conversation id is required');
          }

          await messagesService.ensureParticipant(
            conversationId,
            socket.user.id
          );

          socket.join(getConversationRoom(conversationId));

          return { conversationId };
        },
        callback
      )
  );

  socket.on(SOCKET_EVENTS.CONVERSATION_LEAVE, ({ conversationId } = {}) => {
    if (conversationId) {
      socket.leave(getConversationRoom(conversationId));
    }
  });
};

const registerMessageHandlers = (socket) => {
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, (payload, callback) =>
    runSocketAction(
      socket,
      async () => {
        const message = await messagesService.sendMessage(
          socket.user.id,
          payload
        );

        emitToConversation(
          message.conversationId,
          SOCKET_EVENTS.MESSAGE_CREATED,
          message
        );

        return message;
      },
      callback
    )
  );

  socket.on(SOCKET_EVENTS.MESSAGE_UPDATE, ({ id, ...payload } = {}, callback) =>
    runSocketAction(
      socket,
      async () => {
        const message = await messagesService.editMessage(
          id,
          socket.user.id,
          payload
        );

        emitToConversation(
          message.conversationId,
          SOCKET_EVENTS.MESSAGE_UPDATED,
          message
        );

        return message;
      },
      callback
    )
  );

  socket.on(SOCKET_EVENTS.MESSAGE_READ, ({ id } = {}, callback) =>
    runSocketAction(
      socket,
      async () => {
        const status = await messagesService.markMessageAsRead(
          id,
          socket.user.id
        );
        const conversationId = await messagesService.getMessageConversationId(
          status.messageId
        );

        emitToConversation(
          conversationId,
          SOCKET_EVENTS.MESSAGE_READ_UPDATED,
          status
        );

        return status;
      },
      callback
    )
  );
};

export const emitToConversation = (conversationId, event, payload) => {
  if (!io || !conversationId) {
    return;
  }

  io.to(getConversationRoom(conversationId)).emit(event, payload);
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logger.info(
      { socketId: socket.id, userId: socket.user.id },
      'Socket connected'
    );

    registerConversationHandlers(socket);
    registerMessageHandlers(socket);

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      logger.info(
        { socketId: socket.id, userId: socket.user.id },
        'Socket disconnected'
      );
    });
  });

  return io;
};

export const getIo = () => io;
