import prisma from '../../shared/db/prisma.js';
import {
  badRequest,
  forbidden,
  notFound,
} from '../../shared/errors/http-error.js';

const messageInclude = {
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
  statuses: true,
};

export const ensureParticipant = async (conversationId, userId) => {
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId,
    },
  });

  if (!participant) {
    throw forbidden();
  }

  return participant;
};

const getMessageOrThrow = async (id) => {
  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    throw notFound('Message not found');
  }

  return message;
};

export const getMessageConversationId = async (id) => {
  const message = await getMessageOrThrow(id);

  return message.conversationId;
};

export const sendMessage = async (
  userId,
  { conversationId, content, type = 'TEXT' } = {}
) => {
  if (!conversationId) {
    throw badRequest('Conversation id is required');
  }

  if (typeof content !== 'string' || !content.trim()) {
    throw badRequest('Content is required');
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
    throw badRequest('Conversation id is required');
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
    throw badRequest('Content is required');
  }

  const message = await getMessageOrThrow(id);

  if (message.senderId !== userId) {
    throw forbidden();
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
