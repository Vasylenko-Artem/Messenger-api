export const conversationPaths = {
  '/conversations': {
    post: {
      summary: 'Create new conversation',
      tags: ['Conversations'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateConversationRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Conversation created',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Conversation',
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
      },
    },

    get: {
      summary: 'Get user conversations',
      tags: ['Conversations'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of conversations',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Conversation',
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
      },
    },
  },

  '/conversations/{id}': {
    delete: {
      summary: 'Delete conversation',
      tags: ['Conversations'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Deleted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                },
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
