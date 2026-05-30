import {
  addParticipantsToConversation,
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
      createMany: jest.fn(),
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

    it('uses empty participant ids by default', async () => {
      await expect(createConversation('creator-id', 'PRIVATE')).rejects.toThrow(
        'Private conversation requires one participant'
      );

      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    it('throws when group conversation does not have participants', async () => {
      await expect(
        createConversation('creator-id', 'GROUP', [])
      ).rejects.toThrow('Group conversation requires participants');

      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    it('throws when participant ids are not an array', async () => {
      await expect(
        createConversation('creator-id', 'PRIVATE', 'participant-id')
      ).rejects.toThrow('Participant ids are required');

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

  describe('addParticipantsToConversation', () => {
    it('adds unique participants to group conversation when user is admin', async () => {
      const conversation = {
        id: 'conversation-id',
        type: 'GROUP',
      };
      const updatedConversation = {
        ...conversation,
        participants: [],
      };

      prisma.conversation.findUnique
        .mockResolvedValueOnce(conversation)
        .mockResolvedValueOnce(updatedConversation);
      prisma.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-id',
        role: 'ADMIN',
      });
      prisma.user.count.mockResolvedValue(2);
      prisma.conversationParticipant.createMany.mockResolvedValue({ count: 2 });

      await expect(
        addParticipantsToConversation('conversation-id', 'admin-id', [
          'new-user-id',
          'new-user-id',
          'second-user-id',
          'admin-id',
        ])
      ).resolves.toEqual(updatedConversation);

      expect(prisma.conversation.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: 'conversation-id' },
      });
      expect(prisma.conversationParticipant.findFirst).toHaveBeenCalledWith({
        where: {
          conversationId: 'conversation-id',
          userId: 'admin-id',
        },
      });
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['new-user-id', 'second-user-id'],
          },
        },
      });
      expect(prisma.conversationParticipant.createMany).toHaveBeenCalledWith({
        data: [
          {
            conversationId: 'conversation-id',
            userId: 'new-user-id',
            role: 'MEMBER',
          },
          {
            conversationId: 'conversation-id',
            userId: 'second-user-id',
            role: 'MEMBER',
          },
        ],
        skipDuplicates: true,
      });
      expect(prisma.conversation.findUnique).toHaveBeenNthCalledWith(2, {
        where: { id: 'conversation-id' },
        include: participantInclude,
      });
    });

    it('throws when conversation does not exist', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(
        addParticipantsToConversation('missing-id', 'admin-id', ['user-id'])
      ).rejects.toThrow('Conversation not found');

      expect(prisma.conversationParticipant.findFirst).not.toHaveBeenCalled();
      expect(prisma.conversationParticipant.createMany).not.toHaveBeenCalled();
    });

    it('throws when conversation is private', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'conversation-id',
        type: 'PRIVATE',
      });

      await expect(
        addParticipantsToConversation('conversation-id', 'admin-id', [
          'user-id',
        ])
      ).rejects.toThrow('Cannot add participants to private conversation');

      expect(prisma.conversationParticipant.findFirst).not.toHaveBeenCalled();
      expect(prisma.conversationParticipant.createMany).not.toHaveBeenCalled();
    });

    it('throws when current user is not participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'conversation-id',
        type: 'GROUP',
      });
      prisma.conversationParticipant.findFirst.mockResolvedValue(null);

      await expect(
        addParticipantsToConversation('conversation-id', 'user-id', [
          'new-user-id',
        ])
      ).rejects.toThrow('Forbidden');

      expect(prisma.conversationParticipant.createMany).not.toHaveBeenCalled();
    });

    it('throws when current user is not admin', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'conversation-id',
        type: 'GROUP',
      });
      prisma.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-id',
        role: 'MEMBER',
      });

      await expect(
        addParticipantsToConversation('conversation-id', 'user-id', [
          'new-user-id',
        ])
      ).rejects.toThrow('Forbidden');

      expect(prisma.conversationParticipant.createMany).not.toHaveBeenCalled();
    });

    it('throws when participant ids are empty', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'conversation-id',
        type: 'GROUP',
      });
      prisma.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-id',
        role: 'ADMIN',
      });

      await expect(
        addParticipantsToConversation('conversation-id', 'admin-id', [
          'admin-id',
        ])
      ).rejects.toThrow('Participant ids are required');

      expect(prisma.user.count).not.toHaveBeenCalled();
      expect(prisma.conversationParticipant.createMany).not.toHaveBeenCalled();
    });

    it('uses empty participant ids by default when adding participants', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'conversation-id',
        type: 'GROUP',
      });
      prisma.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-id',
        role: 'ADMIN',
      });

      await expect(
        addParticipantsToConversation('conversation-id', 'admin-id')
      ).rejects.toThrow('Participant ids are required');

      expect(prisma.user.count).not.toHaveBeenCalled();
      expect(prisma.conversationParticipant.createMany).not.toHaveBeenCalled();
    });

    it('throws when any participant does not exist', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'conversation-id',
        type: 'GROUP',
      });
      prisma.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-id',
        role: 'ADMIN',
      });
      prisma.user.count.mockResolvedValue(0);

      await expect(
        addParticipantsToConversation('conversation-id', 'admin-id', [
          'missing-id',
        ])
      ).rejects.toThrow('Participant not found');

      expect(prisma.conversationParticipant.createMany).not.toHaveBeenCalled();
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
