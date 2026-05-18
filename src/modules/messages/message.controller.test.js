import * as messageController from './message.controller.js';

jest.mock('./message.service.js', () => ({
  sendMessage: jest.fn(),
  getMessages: jest.fn(),
  editMessage: jest.fn(),
  markAsRead: jest.fn(),
}));

import * as messageService from './message.service.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockReq = (overrides = {}) => ({
  user: { id: 'user-1' },
  body: {},
  params: {},
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ─── sendMessage ──────────────────────────────────────────────────────────────

describe('sendMessage controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 201 with created message', async () => {
    const message = { id: 'msg-1', content: 'hi', type: 'TEXT' };
    messageService.sendMessage.mockResolvedValue(message);

    const req = mockReq({ body: { conversationId: 'conv-1', content: 'hi' } });
    const res = mockRes();

    await messageController.sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(message);
  });

  it('returns 403 on access denied', async () => {
    const error = new Error('Access denied');
    error.status = 403;
    messageService.sendMessage.mockRejectedValue(error);

    const req = mockReq({ body: { conversationId: 'conv-1', content: 'hi' } });
    const res = mockRes();

    await messageController.sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─── getMessages ──────────────────────────────────────────────────────────────

describe('getMessages controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with messages array', async () => {
    const messages = [{ id: 'msg-1', content: 'hello' }];
    messageService.getMessages.mockResolvedValue(messages);

    const req = mockReq({ params: { conversationId: 'conv-1' } });
    const res = mockRes();

    await messageController.getMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(messages);
  });

  it('returns 403 if not a participant', async () => {
    const error = new Error('Access denied');
    error.status = 403;
    messageService.getMessages.mockRejectedValue(error);

    const req = mockReq({ params: { conversationId: 'conv-1' } });
    const res = mockRes();

    await messageController.getMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─── editMessage ──────────────────────────────────────────────────────────────

describe('editMessage controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with updated message', async () => {
    const updated = { id: 'msg-1', content: 'new text', editedAt: new Date() };
    messageService.editMessage.mockResolvedValue(updated);

    const req = mockReq({ params: { id: 'msg-1' }, body: { content: 'new text' } });
    const res = mockRes();

    await messageController.editMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('returns 403 if not the sender', async () => {
    const error = new Error('Access denied');
    error.status = 403;
    messageService.editMessage.mockRejectedValue(error);

    const req = mockReq({ params: { id: 'msg-1' }, body: { content: 'new text' } });
    const res = mockRes();

    await messageController.editMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 404 if message not found', async () => {
    const error = new Error('Not found');
    error.status = 404;
    messageService.editMessage.mockRejectedValue(error);

    const req = mockReq({ params: { id: 'msg-1' }, body: { content: 'new text' } });
    const res = mockRes();

    await messageController.editMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─── markAsRead ───────────────────────────────────────────────────────────────

describe('markAsRead controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with updated status', async () => {
    const result = { messageId: 'msg-1', userId: 'user-1', status: 'READ' };
    messageService.markAsRead.mockResolvedValue(result);

    const req = mockReq({ params: { id: 'msg-1' } });
    const res = mockRes();

    await messageController.markAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('returns 404 if status not found', async () => {
    const error = new Error('Not found');
    error.status = 404;
    messageService.markAsRead.mockRejectedValue(error);

    const req = mockReq({ params: { id: 'msg-1' } });
    const res = mockRes();

    await messageController.markAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});