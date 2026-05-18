import prisma from '../../shared/db/prisma.js';

const conversationTypes = ['PRIVATE', 'GROUP'];

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

const messageInclude = {
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
};

const normalizeParticipantIds = (userId, participantIds) => {
  if (!Array.isArray(participantIds)) {
    throw new Error('Participant ids are required');
  }

  return [...new Set(participantIds)].filter((id) => id !== userId);
};

const validateParticipantsExist = async (userIds) => {
  const usersCount = await prisma.user.count({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  if (usersCount !== userIds.length) {
    throw new Error('Participant not found');
  }
};

const ensureParticipant = async (conversationId, userId) => {
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId,
    },
  });

  if (!participant) {
    throw new Error('Forbidden');
  }

  return participant;
};

export const createConversation = async (userId, type, participantIds = []) => {
  if (!conversationTypes.includes(type)) {
    throw new Error('Invalid conversation type');
  }

  const uniqueParticipantIds = normalizeParticipantIds(userId, participantIds);

  if (type === 'PRIVATE' && uniqueParticipantIds.length !== 1) {
    throw new Error('Private conversation requires one participant');
  }

  if (type === 'GROUP' && uniqueParticipantIds.length < 1) {
    throw new Error('Group conversation requires participants');
  }

  await validateParticipantsExist([userId, ...uniqueParticipantIds]);

  return prisma.conversation.create({
    data: {
      type,

      participants: {
        create: [
          {
            userId,
            role: 'ADMIN',
          },
          ...uniqueParticipantIds.map((id) => ({
            userId: id,
            role: 'MEMBER',
          })),
        ],
      },
    },
    include: participantInclude,
  });
};

export const getConversations = async (userId) => {
  return prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      ...participantInclude,
      ...messageInclude,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const deleteConversation = async (conversationId, userId) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  await ensureParticipant(conversationId, userId);

  return prisma.conversation.delete({
    where: { id: conversationId },
  });
};
