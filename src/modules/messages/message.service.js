import prisma from '../../shared/db/prisma.js';

// ─── Send message ────────────────────────────────────────────────────────────

export const sendMessage = async (senderId, { conversationId, content, type = 'TEXT' }) => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: senderId } },
  });

  if (!participant) {
    const error = new Error('Access denied: you are not a participant of this conversation');
    error.status = 403;
    throw error;
  }

  const allParticipants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      type,
      statuses: {
        create: allParticipants.map(({ userId }) => ({
          userId,
          status: 'SENT',
        })),
      },
    },
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      type: true,
      createdAt: true,
    },
  });

  return message;
};

// ─── Get messages ─────────────────────────────────────────────────────────────

export const getMessages = async (userId, conversationId) => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });

  if (!participant) {
    const error = new Error('Access denied: you are not a participant of this conversation');
    error.status = 403;
    throw error;
  }

  // Mark all SENT/DELIVERED messages as DELIVERED for this user
  await prisma.messageStatus.updateMany({
    where: {
      userId,
      status: 'SENT',
      message: { conversationId },
    },
    data: { status: 'DELIVERED' },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      content: true,
      type: true,
      createdAt: true,
      sender: {
        select: { id: true, username: true },
      },
    },
  });

  return messages;
};

// ─── Edit message ─────────────────────────────────────────────────────────────

export const editMessage = async (userId, messageId, { content }) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    const error = new Error('Message not found');
    error.status = 404;
    throw error;
  }

  if (message.senderId !== userId) {
    const error = new Error('Access denied: you can only edit your own messages');
    error.status = 403;
    throw error;
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      content,
      editedAt: new Date(),
    },
    select: {
      id: true,
      content: true,
      editedAt: true,
    },
  });

  return updated;
};

// ─── Mark as read ─────────────────────────────────────────────────────────────

export const markAsRead = async (userId, messageId) => {
  const status = await prisma.messageStatus.findUnique({
    where: { messageId_userId: { messageId, userId } },
  });

  if (!status) {
    const error = new Error('Message status not found');
    error.status = 404;
    throw error;
  }

  const updated = await prisma.messageStatus.update({
    where: { messageId_userId: { messageId, userId } },
    data: { status: 'READ' },
    select: {
      messageId: true,
      userId: true,
      status: true,
    },
  });

  return updated;
};