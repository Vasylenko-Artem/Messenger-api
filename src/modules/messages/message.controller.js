import * as messagesService from './message.service.js';
import { emitToConversation } from '../../socket/index.js';
import { SOCKET_EVENTS } from '../../socket/events.js';
import {
  messagesValidation,
  requireAuthUserId,
  validateBody,
  validateParams,
} from '../../shared/validation/validators.js';

export const create = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    const body = validateBody(messagesValidation.create, req);

    const message = await messagesService.sendMessage(userId, body);

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
    const { conversationId } = validateParams(
      messagesValidation.getByConversationParams,
      req
    );

    const messages = await messagesService.getMessages(conversationId, userId);

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    const { id } = validateParams(messagesValidation.idParams, req);
    const body = validateBody(messagesValidation.update, req);

    const message = await messagesService.editMessage(id, userId, body);

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
    const { id } = validateParams(messagesValidation.idParams, req);

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
