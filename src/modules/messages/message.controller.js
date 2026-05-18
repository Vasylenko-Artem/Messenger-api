import * as messagesService from './message.service.js';
import { emitToConversation } from '../../socket/index.js';
import { SOCKET_EVENTS } from '../../socket/events.js';

const getErrorStatus = (message) => {
  if (message === 'Forbidden') {
    return 403;
  }

  if (message === 'Message not found') {
    return 404;
  }

  return 400;
};

const getUserId = (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }

  return req.user.id;
};

export const create = async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return;
    }

    const message = await messagesService.sendMessage(userId, req.body);

    emitToConversation(
      message.conversationId,
      SOCKET_EVENTS.MESSAGE_CREATED,
      message
    );

    res.status(201).json(message);
  } catch (error) {
    console.log(error);
    res.status(getErrorStatus(error.message)).json({ message: error.message });
  }
};

export const getByConversation = async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return;
    }

    const messages = await messagesService.getMessages(
      req.params.conversationId,
      userId
    );

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(getErrorStatus(error.message)).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return;
    }

    const message = await messagesService.editMessage(
      req.params.id,
      userId,
      req.body
    );

    emitToConversation(
      message.conversationId,
      SOCKET_EVENTS.MESSAGE_UPDATED,
      message
    );

    res.json(message);
  } catch (error) {
    console.log(error);
    res.status(getErrorStatus(error.message)).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return;
    }

    const status = await messagesService.markMessageAsRead(
      req.params.id,
      userId
    );
    const conversationId = await messagesService.getMessageConversationId(
      status.messageId
    );

    emitToConversation(
      conversationId,
      SOCKET_EVENTS.MESSAGE_READ_UPDATED,
      status
    );

    res.json(status);
  } catch (error) {
    console.log(error);
    res.status(getErrorStatus(error.message)).json({ message: error.message });
  }
};
