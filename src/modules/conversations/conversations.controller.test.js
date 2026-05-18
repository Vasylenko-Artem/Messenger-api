import {
  create,
  getConversations,
  remove,
} from './conversations.controller.js';
import * as conversationsService from './conversations.service.js';

jest.mock('./conversations.service.js', () => ({
  createConversation: jest.fn(),
  getConversations: jest.fn(),
  deleteConversation: jest.fn(),
}));

const createResponse = () => ({
  json: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
});

describe('Conversations Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('responds with created conversation', async () => {
      const conversation = {
        id: 'conversation-id',
        type: 'PRIVATE',
      };

      conversationsService.createConversation.mockResolvedValue(conversation);

      const req = {
        user: { id: 'user-id' },
        body: {
          type: 'PRIVATE',
          participantIds: ['participant-id'],
        },
      };
      const res = createResponse();

      await create(req, res);

      expect(conversationsService.createConversation).toHaveBeenCalledWith(
        'user-id',
        'PRIVATE',
        ['participant-id']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(conversation);
    });

    it('responds with 401 when user is missing from request', async () => {
      const req = {
        body: {
          type: 'PRIVATE',
          participantIds: ['participant-id'],
        },
      };
      const res = createResponse();

      await create(req, res);

      expect(conversationsService.createConversation).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('responds with 400 when validation fails', async () => {
      conversationsService.createConversation.mockRejectedValue(
        new Error('Invalid conversation type')
      );

      const req = {
        user: { id: 'user-id' },
        body: {
          type: 'UNKNOWN',
          participantIds: [],
        },
      };
      const res = createResponse();

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid conversation type',
      });
    });
  });

  describe('getConversations', () => {
    it('responds with user conversations', async () => {
      const conversations = [{ id: 'conversation-id' }];

      conversationsService.getConversations.mockResolvedValue(conversations);

      const req = {
        user: { id: 'user-id' },
      };
      const res = createResponse();

      await getConversations(req, res);

      expect(conversationsService.getConversations).toHaveBeenCalledWith(
        'user-id'
      );
      expect(res.json).toHaveBeenCalledWith(conversations);
    });

    it('responds with 401 when user is missing from request', async () => {
      const req = {};
      const res = createResponse();

      await getConversations(req, res);

      expect(conversationsService.getConversations).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });
  });

  describe('remove', () => {
    it('deletes conversation and responds with success', async () => {
      conversationsService.deleteConversation.mockResolvedValue({
        id: 'conversation-id',
      });

      const req = {
        user: { id: 'user-id' },
        params: {
          id: 'conversation-id',
        },
      };
      const res = createResponse();

      await remove(req, res);

      expect(conversationsService.deleteConversation).toHaveBeenCalledWith(
        'conversation-id',
        'user-id'
      );
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('responds with 403 when user is not participant', async () => {
      conversationsService.deleteConversation.mockRejectedValue(
        new Error('Forbidden')
      );

      const req = {
        user: { id: 'user-id' },
        params: {
          id: 'conversation-id',
        },
      };
      const res = createResponse();

      await remove(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('responds with 404 when conversation does not exist', async () => {
      conversationsService.deleteConversation.mockRejectedValue(
        new Error('Conversation not found')
      );

      const req = {
        user: { id: 'user-id' },
        params: {
          id: 'missing-id',
        },
      };
      const res = createResponse();

      await remove(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Conversation not found',
      });
    });
  });
});
