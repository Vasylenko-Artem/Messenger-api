export const messageSchemas = {
  MessageType: {
    type: 'string',
    enum: ['TEXT', 'IMAGE', 'FILE'],
    example: 'TEXT',
  },

  MessageStatusType: {
    type: 'string',
    enum: ['SENT', 'DELIVERED', 'READ'],
    example: 'READ',
  },

  MessageStatus: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      messageId: {
        type: 'string',
        format: 'uuid',
      },
      userId: {
        type: 'string',
        format: 'uuid',
      },
      status: {
        $ref: '#/components/schemas/MessageStatusType',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },

  Message: {
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
      senderId: {
        type: 'string',
        format: 'uuid',
      },
      content: {
        type: 'string',
        example: 'Hello',
      },
      type: {
        $ref: '#/components/schemas/MessageType',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      editedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
      },
      sender: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          username: {
            type: 'string',
            example: 'testuser',
          },
        },
      },
      statuses: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/MessageStatus',
        },
      },
    },
  },
};
