import * as messageService from './message.service.js';

jest.mock('../../shared/db/prisma.js', () => ({
  __esModule: true,
  default: {
    conversationParticipant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    messageStatus: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import prisma from '../../shared/db/prisma.js';

// ─── sendMessage ──────────────────────────────────────────────────────────────

describe('sendMessage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws 403 if user is not a participant', async () => {
    prisma.conversationParticipant.findUnique.mockResolvedValue(null);

    await expect(
      messageService.sendMessage('user-1', { conversationId: 'conv-1', content: 'hi' })
    ).rejects.toMatchObject({ status: 403 });
  });

  it('creates message with statuses for all participants', async () => {
    prisma.conversationParticipant.findUnique.mockResolvedValue({ userId: 'user-1' });
    prisma.conversationParticipant.findMany.mockResolvedValue([
      { userId: 'user-1' },
      { userId: 'user-2' },
    ]);
    const mockMessage = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content: 'hi',
      type: 'TEXT',
      createdAt: new Date(),
    };
    prisma.message.create.mockResolvedValue(mockMessage);

    const result = await messageService.sendMessage('user-1', {
      conversationId: 'conv-1',
      content: 'hi',
    });

    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          senderId: 'user-1',
          content: 'hi',
          type: 'TEXT',
        }),
      })
    );
    expect(result).toEqual(mockMessage);
  });
});

// ─── getMessages ──────────────────────────────────────────────────────────────

describe('getMessages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws 403 if user is not a participant', async () => {
    prisma.conversationParticipant.findUnique.mockResolvedValue(null);

    await expect(
      messageService.getMessages('user-1', 'conv-1')
    ).rejects.toMatchObject({ status: 403 });
  });

  it('returns messages sorted asc and marks SENT as DELIVERED', async () => {
    prisma.conversationParticipant.findUnique.mockResolvedValue({ userId: 'user-1' });
    prisma.messageStatus.updateMany.mockResolvedValue({});
    const mockMessages = [
      {
        id: 'msg-1',
        content: 'hello',
        type: 'TEXT',
        createdAt: new Date(),
        sender: { id: 'user-2', username: 'artemka' },
      },
    ];
    prisma.message.findMany.mockResolvedValue(mockMessages);

    const result = await messageService.getMessages('user-1', 'conv-1');

    expect(prisma.messageStatus.updateMany).toHaveBeenCalled();
    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'asc' } })
    );
    expect(result).toEqual(mockMessages);
  });
});

// ─── editMessage ──────────────────────────────────────────────────────────────

describe('editMessage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws 404 if message not found', async () => {
    prisma.message.findUnique.mockResolvedValue(null);

    await expect(
      messageService.editMessage('user-1', 'msg-1', { content: 'new text' })
    ).rejects.toMatchObject({ status: 404 });
  });

  it('throws 403 if user is not the sender', async () => {
    prisma.message.findUnique.mockResolvedValue({ id: 'msg-1', senderId: 'user-2' });

    await expect(
      messageService.editMessage('user-1', 'msg-1', { content: 'new text' })
    ).rejects.toMatchObject({ status: 403 });
  });

  it('updates content and sets editedAt', async () => {
    prisma.message.findUnique.mockResolvedValue({ id: 'msg-1', senderId: 'user-1' });
    const mockUpdated = { id: 'msg-1', content: 'new text', editedAt: new Date() };
    prisma.message.update.mockResolvedValue(mockUpdated);

    const result = await messageService.editMessage('user-1', 'msg-1', { content: 'new text' });

    expect(prisma.message.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ content: 'new text' }),
      })
    );
    expect(result.editedAt).toBeDefined();
  });
});

// ─── markAsRead ───────────────────────────────────────────────────────────────

describe('markAsRead', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws 404 if status not found', async () => {
    prisma.messageStatus.findUnique.mockResolvedValue(null);

    await expect(
      messageService.markAsRead('user-1', 'msg-1')
    ).rejects.toMatchObject({ status: 404 });
  });

  it('updates status to READ only for current user', async () => {
    prisma.messageStatus.findUnique.mockResolvedValue({
      messageId: 'msg-1',
      userId: 'user-1',
      status: 'DELIVERED',
    });
    const mockResult = { messageId: 'msg-1', userId: 'user-1', status: 'READ' };
    prisma.messageStatus.update.mockResolvedValue(mockResult);

    const result = await messageService.markAsRead('user-1', 'msg-1');

    expect(prisma.messageStatus.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { messageId_userId: { messageId: 'msg-1', userId: 'user-1' } },
        data: { status: 'READ' },
      })
    );
    expect(result.status).toBe('READ');
  });
});