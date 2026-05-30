import {
  editMessage,
  getMessageConversationId,
  getMessages,
  markMessageAsRead,
  sendMessage,
} from './message.service.js';
import prisma from '../../shared/db/prisma.js';

jest.mock('../../shared/db/prisma.js', () => ({
  __esModule: true,
  default: {
    conversationParticipant: {
      findFirst: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    messageStatus: {
      upsert: jest.fn(),
    },
  },
}));

describe('Message Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('creates a message when user is conversation participant', async () => {
      const message = {
        id: 'message-id',
        conversationId: 'conversation-id',
        senderId: 'user-id',
        content: 'hello',
      };

      prisma.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-id',
      });
      prisma.message.create.mockResolvedValue(message);

      await expect(
        sendMessage('user-id', {
          conversationId: 'conversation-id',
          content: ' hello ',
        })
      ).resolves.toEqual(message);

      expect(prisma.conversationParticipant.findFirst).toHaveBeenCalledWith({
        where: {
          conversationId: 'conversation-id',
          userId: 'user-id',
        },
      });
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          conversationId: 'conversation-id',
          senderId: 'user-id',
          content: 'hello',
          type: 'TEXT',
          statuses: {
            create: [
              {
                userId: 'user-id',
                status: 'SENT',
              },
            ],
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
          statuses: true,
        },
      });
    });

    it('throws when content is empty', async () => {
      await expect(
        sendMessage('user-id', {
          conversationId: 'conversation-id',
          content: '   ',
        })
      ).rejects.toThrow('Content is required');

      expect(prisma.message.create).not.toHaveBeenCalled();
    });

    it('throws when payload is missing', async () => {
      await expect(sendMessage('user-id')).rejects.toThrow(
        'Conversation id is required'
      );
    });

    it('throws when user is not conversation participant', async () => {
      prisma.conversationParticipant.findFirst.mockResolvedValue(null);

      await expect(
        sendMessage('user-id', {
          conversationId: 'conversation-id',
          content: 'hello',
        })
      ).rejects.toThrow('Forbidden');

      expect(prisma.message.create).not.toHaveBeenCalled();
    });
  });

  describe('getMessages', () => {
    it('returns messages for participant', async () => {
      const messages = [{ id: 'message-id' }];

      prisma.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-id',
      });
      prisma.message.findMany.mockResolvedValue(messages);

      await expect(getMessages('conversation-id', 'user-id')).resolves.toEqual(
        messages
      );

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          conversationId: 'conversation-id',
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
          statuses: true,
        },
      });
    });

    it('throws when conversation id is missing', async () => {
      await expect(getMessages(undefined, 'user-id')).rejects.toThrow(
        'Conversation id is required'
      );

      expect(prisma.message.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getMessageConversationId', () => {
    it('returns message conversation id', async () => {
      prisma.message.findUnique.mockResolvedValue({
        id: 'message-id',
        conversationId: 'conversation-id',
      });

      await expect(getMessageConversationId('message-id')).resolves.toBe(
        'conversation-id'
      );

      expect(prisma.message.findUnique).toHaveBeenCalledWith({
        where: { id: 'message-id' },
      });
    });

    it('throws when message does not exist', async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      await expect(getMessageConversationId('missing-id')).rejects.toThrow(
        'Message not found'
      );
    });
  });

  describe('editMessage', () => {
    it('updates own message content', async () => {
      const updatedMessage = {
        id: 'message-id',
        senderId: 'user-id',
        content: 'updated',
      };

      prisma.message.findUnique.mockResolvedValue({
        id: 'message-id',
        senderId: 'user-id',
      });
      prisma.message.update.mockResolvedValue(updatedMessage);

      await expect(
        editMessage('message-id', 'user-id', { content: ' updated ' })
      ).resolves.toEqual(updatedMessage);

      expect(prisma.message.update).toHaveBeenCalledWith({
        where: { id: 'message-id' },
        data: {
          content: 'updated',
          editedAt: expect.any(Date),
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
          statuses: true,
        },
      });
    });

    it('throws when message does not exist', async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      await expect(
        editMessage('missing-id', 'user-id', { content: 'updated' })
      ).rejects.toThrow('Message not found');
    });

    it('throws when user is not message sender', async () => {
      prisma.message.findUnique.mockResolvedValue({
        id: 'message-id',
        senderId: 'another-user-id',
      });

      await expect(
        editMessage('message-id', 'user-id', { content: 'updated' })
      ).rejects.toThrow('Forbidden');

      expect(prisma.message.update).not.toHaveBeenCalled();
    });

    it('throws when update payload is missing', async () => {
      await expect(editMessage('message-id', 'user-id')).rejects.toThrow(
        'Content is required'
      );
    });
  });

  describe('markMessageAsRead', () => {
    it('upserts READ status for participant', async () => {
      const status = {
        id: 'status-id',
        messageId: 'message-id',
        userId: 'user-id',
        status: 'READ',
      };

      prisma.message.findUnique.mockResolvedValue({
        id: 'message-id',
        conversationId: 'conversation-id',
      });
      prisma.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-id',
      });
      prisma.messageStatus.upsert.mockResolvedValue(status);

      await expect(markMessageAsRead('message-id', 'user-id')).resolves.toEqual(
        status
      );

      expect(prisma.messageStatus.upsert).toHaveBeenCalledWith({
        where: {
          messageId_userId: {
            messageId: 'message-id',
            userId: 'user-id',
          },
        },
        create: {
          messageId: 'message-id',
          userId: 'user-id',
          status: 'READ',
        },
        update: {
          status: 'READ',
        },
      });
    });

    it('throws when user is not conversation participant', async () => {
      prisma.message.findUnique.mockResolvedValue({
        id: 'message-id',
        conversationId: 'conversation-id',
      });
      prisma.conversationParticipant.findFirst.mockResolvedValue(null);

      await expect(markMessageAsRead('message-id', 'user-id')).rejects.toThrow(
        'Forbidden'
      );

      expect(prisma.messageStatus.upsert).not.toHaveBeenCalled();
    });
  });
});
