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

  CreateConversationRequest: {
    type: 'object',
    required: ['type', 'participantIds'],
    properties: {
      type: {
        $ref: '#/components/schemas/ConversationType',
      },
      participantIds: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
        },
        example: ['9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9'],
      },
    },
  },

  AddConversationParticipantsRequest: {
    type: 'object',
    required: ['participantIds'],
    properties: {
      participantIds: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
        },
        example: ['9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9'],
      },
    },
  },
};
