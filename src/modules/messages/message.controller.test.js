import {
  create,
  getByConversation,
  markAsRead,
  update,
} from './message.controller.js';
import * as messagesService from './message.service.js';
import { emitToConversation } from '../../socket/index.js';
import { SOCKET_EVENTS } from '../../socket/events.js';

jest.mock('./message.service.js', () => ({
  sendMessage: jest.fn(),
  getMessages: jest.fn(),
  editMessage: jest.fn(),
  markMessageAsRead: jest.fn(),
  getMessageConversationId: jest.fn(),
}));

jest.mock('../../socket/index.js', () => ({
  emitToConversation: jest.fn(),
}));

const createResponse = () => ({
  json: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
});

describe('Message Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('responds with created message', async () => {
      const message = {
        id: 'message-id',
        conversationId: 'conversation-id',
        content: 'hello',
      };

      messagesService.sendMessage.mockResolvedValue(message);

      const req = {
        user: { id: 'user-id' },
        body: {
          conversationId: 'conversation-id',
          content: 'hello',
        },
      };
      const res = createResponse();

      await create(req, res);

      expect(messagesService.sendMessage).toHaveBeenCalledWith(
        'user-id',
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(message);
      expect(emitToConversation).toHaveBeenCalledWith(
        'conversation-id',
        SOCKET_EVENTS.MESSAGE_CREATED,
        message
      );
    });

    it('responds with 401 when user is missing from request', async () => {
      const req = { body: {} };
      const res = createResponse();

      await create(req, res);

      expect(messagesService.sendMessage).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('responds with 403 when service rejects access', async () => {
      const error = new Error('Forbidden');
      messagesService.sendMessage.mockRejectedValue(error);

      const req = {
        user: { id: 'user-id' },
        body: {
          conversationId: 'conversation-id',
          content: 'hello',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getByConversation', () => {
    it('responds with conversation messages', async () => {
      const messages = [{ id: 'message-id' }];

      messagesService.getMessages.mockResolvedValue(messages);

      const req = {
        user: { id: 'user-id' },
        params: {
          conversationId: 'conversation-id',
        },
      };
      const res = createResponse();

      await getByConversation(req, res);

      expect(messagesService.getMessages).toHaveBeenCalledWith(
        'conversation-id',
        'user-id'
      );
      expect(res.json).toHaveBeenCalledWith(messages);
    });
  });

  describe('update', () => {
    it('responds with updated message', async () => {
      const message = {
        id: 'message-id',
        conversationId: 'conversation-id',
        content: 'updated',
      };

      messagesService.editMessage.mockResolvedValue(message);

      const req = {
        user: { id: 'user-id' },
        params: {
          id: 'message-id',
        },
        body: {
          content: 'updated',
        },
      };
      const res = createResponse();

      await update(req, res);

      expect(messagesService.editMessage).toHaveBeenCalledWith(
        'message-id',
        'user-id',
        req.body
      );
      expect(res.json).toHaveBeenCalledWith(message);
      expect(emitToConversation).toHaveBeenCalledWith(
        'conversation-id',
        SOCKET_EVENTS.MESSAGE_UPDATED,
        message
      );
    });

    it('responds with 404 when message does not exist', async () => {
      const error = new Error('Message not found');
      messagesService.editMessage.mockRejectedValue(error);

      const req = {
        user: { id: 'user-id' },
        params: {
          id: 'missing-id',
        },
        body: {
          content: 'updated',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await update(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('markAsRead', () => {
    it('responds with read status', async () => {
      const status = {
        id: 'status-id',
        messageId: 'message-id',
        status: 'READ',
      };

      messagesService.markMessageAsRead.mockResolvedValue(status);
      messagesService.getMessageConversationId.mockResolvedValue(
        'conversation-id'
      );

      const req = {
        user: { id: 'user-id' },
        params: {
          id: 'message-id',
        },
      };
      const res = createResponse();

      await markAsRead(req, res);

      expect(messagesService.markMessageAsRead).toHaveBeenCalledWith(
        'message-id',
        'user-id'
      );
      expect(messagesService.getMessageConversationId).toHaveBeenCalledWith(
        'message-id'
      );
      expect(emitToConversation).toHaveBeenCalledWith(
        'conversation-id',
        SOCKET_EVENTS.MESSAGE_READ_UPDATED,
        status
      );
      expect(res.json).toHaveBeenCalledWith(status);
    });
  });
});
