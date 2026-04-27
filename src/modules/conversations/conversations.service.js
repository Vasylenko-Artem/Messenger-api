import prisma from '../../shared/db/prisma.js';

export const createConversation = async (userId, type, participantIds = []) => {
  const conversation = await prisma.conversation.create({
    data: {
      type,

      participants: {
        create: [
          // the creator himself is always a participant
          {
            userId,
            role: 'ADMIN',
          },
          // other participants
          ...participantIds.map((id) => ({
            userId: id,
            role: 'MEMBER',
          })),
        ],
      },
    },
    include: {
      participants: true,
    },
  });

  return conversation;
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
      participants: {
        include: {
          user: true,
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
};

export const deleteConversation = async (conversationId, userId) => {
  // проверка что user в чате
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId,
    },
  });

  if (!participant) {
    throw new Error('Forbidden');
  }

  return prisma.conversation.delete({
    where: { id: conversationId },
  });
};
