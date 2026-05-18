import {
  createConversation,
  deleteConversation,
  getConversations,
} from './conversations.service.js';
import prisma from '../../shared/db/prisma.js';

jest.mock('../../shared/db/prisma.js', () => ({
  __esModule: true,
  default: {
    user: {
      count: jest.fn(),
    },
    conversation: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    conversationParticipant: {
      findFirst: jest.fn(),
    },
  },
}));

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  createdAt: true,
  updatedAt: true,
};

const participantInclude = {
  participants: {
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  },
};

describe('Conversations Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createConversation', () => {
    it('creates private conversation with creator and one participant', async () => {
      const conversation = {
        id: 'conversation-id',
        type: 'PRIVATE',
      };

      prisma.user.count.mockResolvedValue(2);
      prisma.conversation.create.mockResolvedValue(conversation);

      await expect(
        createConversation('creator-id', 'PRIVATE', ['participant-id'])
      ).resolves.toEqual(conversation);

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['creator-id', 'participant-id'],
          },
        },
      });
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          type: 'PRIVATE',
          participants: {
            create: [
              {
                userId: 'creator-id',
                role: 'ADMIN',
              },
              {
                userId: 'participant-id',
                role: 'MEMBER',
              },
            ],
          },
        },
        include: participantInclude,
      });
    });

    it('creates group conversation with unique participants', async () => {
      const conversation = {
        id: 'conversation-id',
        type: 'GROUP',
      };

      prisma.user.count.mockResolvedValue(3);
      prisma.conversation.create.mockResolvedValue(conversation);

      await expect(
        createConversation('creator-id', 'GROUP', [
          'participant-id',
          'participant-id',
          'creator-id',
          'second-participant-id',
        ])
      ).resolves.toEqual(conversation);

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['creator-id', 'participant-id', 'second-participant-id'],
          },
        },
      });
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          type: 'GROUP',
          participants: {
            create: [
              {
                userId: 'creator-id',
                role: 'ADMIN',
              },
              {
                userId: 'participant-id',
                role: 'MEMBER',
              },
              {
                userId: 'second-participant-id',
                role: 'MEMBER',
              },
            ],
          },
        },
        include: participantInclude,
      });
    });

    it('throws when conversation type is invalid', async () => {
      await expect(
        createConversation('creator-id', 'UNKNOWN', ['participant-id'])
      ).rejects.toThrow('Invalid conversation type');

      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    it('throws when private conversation does not have exactly one participant', async () => {
      await expect(
        createConversation('creator-id', 'PRIVATE', [
          'first-participant-id',
          'second-participant-id',
        ])
      ).rejects.toThrow('Private conversation requires one participant');

      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    it('throws when group conversation does not have participants', async () => {
      await expect(
        createConversation('creator-id', 'GROUP', [])
      ).rejects.toThrow('Group conversation requires participants');

      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    it('throws when any participant does not exist', async () => {
      prisma.user.count.mockResolvedValue(1);

      await expect(
        createConversation('creator-id', 'PRIVATE', ['missing-id'])
      ).rejects.toThrow('Participant not found');

      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });
  });

  describe('getConversations', () => {
    it('returns conversations where user is participant', async () => {
      const conversations = [{ id: 'conversation-id' }];

      prisma.conversation.findMany.mockResolvedValue(conversations);

      await expect(getConversations('user-id')).resolves.toEqual(conversations);

      expect(prisma.conversation.findMany).toHaveBeenCalledWith({
        where: {
          participants: {
            some: {
              userId: 'user-id',
            },
          },
        },
        include: {
          ...participantInclude,
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('deleteConversation', () => {
    it('deletes conversation when user is participant', async () => {
      const conversation = {
        id: 'conversation-id',
      };

      prisma.conversation.findUnique.mockResolvedValue(conversation);
      prisma.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-id',
      });
      prisma.conversation.delete.mockResolvedValue(conversation);

      await expect(
        deleteConversation('conversation-id', 'user-id')
      ).resolves.toEqual(conversation);

      expect(prisma.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: 'conversation-id' },
      });
      expect(prisma.conversationParticipant.findFirst).toHaveBeenCalledWith({
        where: {
          conversationId: 'conversation-id',
          userId: 'user-id',
        },
      });
      expect(prisma.conversation.delete).toHaveBeenCalledWith({
        where: { id: 'conversation-id' },
      });
    });

    it('throws when conversation does not exist', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(deleteConversation('missing-id', 'user-id')).rejects.toThrow(
        'Conversation not found'
      );

      expect(prisma.conversationParticipant.findFirst).not.toHaveBeenCalled();
      expect(prisma.conversation.delete).not.toHaveBeenCalled();
    });

    it('throws when user is not participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'conversation-id',
      });
      prisma.conversationParticipant.findFirst.mockResolvedValue(null);

      await expect(
        deleteConversation('conversation-id', 'user-id')
      ).rejects.toThrow('Forbidden');

      expect(prisma.conversation.delete).not.toHaveBeenCalled();
    });
  });
});
