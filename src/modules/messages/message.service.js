import prisma from '../../shared/db/prisma.js';

const messageInclude = {
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
  statuses: true,
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

const getMessageOrThrow = async (id) => {
  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    throw new Error('Message not found');
  }

  return message;
};

export const sendMessage = async (
  userId,
  { conversationId, content, type = 'TEXT' } = {}
) => {
  if (!conversationId) {
    throw new Error('Conversation id is required');
  }

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Content is required');
  }

  await ensureParticipant(conversationId, userId);

  return prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content: content.trim(),
      type,
      statuses: {
        create: [
          {
            userId,
            status: 'SENT',
          },
        ],
      },
    },
    include: messageInclude,
  });
};

export const getMessages = async (conversationId, userId) => {
  if (!conversationId) {
    throw new Error('Conversation id is required');
  }

  await ensureParticipant(conversationId, userId);

  return prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: messageInclude,
  });
};

export const editMessage = async (id, userId, { content } = {}) => {
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Content is required');
  }

  const message = await getMessageOrThrow(id);

  if (message.senderId !== userId) {
    throw new Error('Forbidden');
  }

  return prisma.message.update({
    where: { id },
    data: {
      content: content.trim(),
      editedAt: new Date(),
    },
    include: messageInclude,
  });
};

export const markMessageAsRead = async (id, userId) => {
  const message = await getMessageOrThrow(id);

  await ensureParticipant(message.conversationId, userId);

  return prisma.messageStatus.upsert({
    where: {
      messageId_userId: {
        messageId: id,
        userId,
      },
    },
    create: {
      messageId: id,
      userId,
      status: 'READ',
    },
    update: {
      status: 'READ',
    },
  });
};
