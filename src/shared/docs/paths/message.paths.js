export const messagePaths = {
  '/messages': {
    post: {
      summary: 'Send message',
      tags: ['Messages'],
      security: [{ accessTokenCookie: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SendMessageRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Message sent',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Message',
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
      },
    },
  },

  '/messages/{conversationId}': {
    get: {
      summary: 'Get conversation messages',
      tags: ['Messages'],
      security: [{ accessTokenCookie: [] }],
      parameters: [
        {
          name: 'conversationId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        200: {
          description: 'Conversation messages',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Message',
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
      },
    },
  },

  '/messages/{id}': {
    patch: {
      summary: 'Edit message',
      tags: ['Messages'],
      security: [{ accessTokenCookie: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/EditMessageRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Updated message',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Message',
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
      },
    },
  },

  '/messages/{id}/read': {
    patch: {
      summary: 'Mark message as read',
      tags: ['Messages'],
      security: [{ accessTokenCookie: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        200: {
          description: 'Message read status',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MessageStatus',
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
      },
    },
  },
};
