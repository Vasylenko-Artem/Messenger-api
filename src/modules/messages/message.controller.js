import * as messagesService from './message.service.js';
import { emitToConversation } from '../../socket/index.js';
import { SOCKET_EVENTS } from '../../socket/events.js';
import { requireAuthUserId } from '../../shared/validation/validators.js';

export const create = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    const message = await messagesService.sendMessage(userId, req.body);

    emitToConversation(
      message.conversationId,
      SOCKET_EVENTS.MESSAGE_CREATED,
      message
    );

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const getByConversation = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    const { conversationId } = req.params;

    const messages = await messagesService.getMessages(conversationId, userId);

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    const { id } = req.params;

    const message = await messagesService.editMessage(id, userId, req.body);

    emitToConversation(
      message.conversationId,
      SOCKET_EVENTS.MESSAGE_UPDATED,
      message
    );

    res.json(message);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    const { id } = req.params;

    const status = await messagesService.markMessageAsRead(id, userId);
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
    next(error);
  }
};
