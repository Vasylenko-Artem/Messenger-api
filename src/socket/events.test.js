import { SOCKET_EVENTS, getConversationRoom } from './events.js';

describe('Socket events', () => {
  it('exports socket event names', () => {
    expect(SOCKET_EVENTS).toEqual({
      CONNECTION: 'connection',
      DISCONNECT: 'disconnect',
      ERROR: 'error',
      CONVERSATION_JOIN: 'conversation:join',
      CONVERSATION_LEAVE: 'conversation:leave',
      MESSAGE_SEND: 'message:send',
      MESSAGE_CREATED: 'message:created',
      MESSAGE_UPDATE: 'message:update',
      MESSAGE_UPDATED: 'message:updated',
      MESSAGE_READ: 'message:read',
      MESSAGE_READ_UPDATED: 'message:read:updated',
    });
  });

  it('builds conversation room name', () => {
    expect(getConversationRoom('conversation-id')).toBe(
      'conversation:conversation-id'
    );
  });
});
