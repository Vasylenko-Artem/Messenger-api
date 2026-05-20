export const conversationSchemas = {
  ConversationType: {
    type: 'string',
    enum: ['PRIVATE', 'GROUP'],
    example: 'PRIVATE',
  },

  ParticipantRole: {
    type: 'string',
    enum: ['MEMBER', 'ADMIN'],
    example: 'MEMBER',
  },

  ConversationParticipant: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      conversationId: {
        type: 'string',
        format: 'uuid',
      },
      userId: {
        type: 'string',
        format: 'uuid',
      },
      role: {
        $ref: '#/components/schemas/ParticipantRole',
      },
      joinedAt: {
        type: 'string',
        format: 'date-time',
      },
      user: {
        $ref: '#/components/schemas/User',
      },
    },
  },

  Conversation: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      type: {
        $ref: '#/components/schemas/ConversationType',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      participants: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ConversationParticipant',
        },
      },
      messages: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Message',
        },
      },
    },
  },
};
