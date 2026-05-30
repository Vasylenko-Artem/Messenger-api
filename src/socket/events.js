export const SOCKET_EVENTS = {
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
};

export const getConversationRoom = (conversationId) =>
  `conversation:${conversationId}`;
