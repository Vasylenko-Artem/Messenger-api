import {
  addParticipants,
  create,
  getConversations,
  remove,
} from './conversations.controller.js';
import * as conversationsService from './conversations.service.js';

jest.mock('./conversations.service.js', () => ({
  addParticipantsToConversation: jest.fn(),
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

    it('passes 401 error when user is missing from request', async () => {
      const req = {
        body: {
          type: 'PRIVATE',
          participantIds: ['participant-id'],
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await create(req, res, next);

      expect(conversationsService.createConversation).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Unauthorized', statusCode: 401 })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it('passes 400 error when validation fails', async () => {
      const req = {
        user: { id: 'user-id' },
        body: {
          type: 'UNKNOWN',
          participantIds: [],
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await create(req, res, next);

      expect(conversationsService.createConversation).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Validation failed' })
      );
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

    it('passes 401 error when user is missing from request', async () => {
      const req = {};
      const res = createResponse();
      const next = jest.fn();

      await getConversations(req, res, next);

      expect(conversationsService.getConversations).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Unauthorized', statusCode: 401 })
      );
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('addParticipants', () => {
    it('adds participants and responds with updated conversation', async () => {
      const conversation = {
        id: 'conversation-id',
        type: 'GROUP',
      };

      conversationsService.addParticipantsToConversation.mockResolvedValue(
        conversation
      );

      const req = {
        user: { id: 'user-id' },
        params: {
          id: 'conversation-id',
        },
        body: {
          participantIds: ['participant-id'],
        },
      };
      const res = createResponse();

      await addParticipants(req, res);

      expect(
        conversationsService.addParticipantsToConversation
      ).toHaveBeenCalledWith('conversation-id', 'user-id', ['participant-id']);
      expect(res.json).toHaveBeenCalledWith(conversation);
    });

    it('passes 401 error when user is missing from request', async () => {
      const req = {
        params: {
          id: 'conversation-id',
        },
        body: {
          participantIds: ['participant-id'],
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await addParticipants(req, res, next);

      expect(
        conversationsService.addParticipantsToConversation
      ).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Unauthorized', statusCode: 401 })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it('passes service errors to next', async () => {
      const error = new Error('Forbidden');
      conversationsService.addParticipantsToConversation.mockRejectedValue(
        error
      );

      const req = {
        user: { id: 'user-id' },
        params: {
          id: 'conversation-id',
        },
        body: {
          participantIds: ['participant-id'],
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await addParticipants(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
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
      const error = new Error('Forbidden');
      conversationsService.deleteConversation.mockRejectedValue(error);

      const req = {
        user: { id: 'user-id' },
        params: {
          id: 'conversation-id',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await remove(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('responds with 404 when conversation does not exist', async () => {
      const error = new Error('Conversation not found');
      conversationsService.deleteConversation.mockRejectedValue(error);

      const req = {
        user: { id: 'user-id' },
        params: {
          id: 'missing-id',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await remove(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
