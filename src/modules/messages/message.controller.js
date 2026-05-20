import * as messagesService from './message.service.js';
import { emitToConversation } from '../../socket/index.js';
import { SOCKET_EVENTS } from '../../socket/events.js';
import {
  assertObjectBody,
  optionalEnumValue,
  requireAuthUserId,
  requiredString,
} from '../../shared/validation/validators.js';

const messageTypes = ['TEXT', 'IMAGE', 'FILE'];

export const create = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    assertObjectBody(req.body);

    const body = {
      conversationId: requiredString(req.body.conversationId, 'conversationId'),
      content: requiredString(req.body.content, 'content'),
      type: optionalEnumValue(req.body.type, 'type', messageTypes),
    };

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
    const conversationId = requiredString(
      req.params.conversationId,
      'conversationId'
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
    assertObjectBody(req.body);

    const id = requiredString(req.params.id, 'id');
    const body = {
      content: requiredString(req.body.content, 'content'),
    };

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
    const id = requiredString(req.params.id, 'id');

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
