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
              type: 'object',
              required: ['type', 'participantIds'],
              properties: {
                type: { type: 'string', example: 'private' },
                participantIds: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Conversation created' },
        401: { description: 'Unauthorized' },
      },
    },

    get: {
      summary: 'Get user conversations',
      tags: ['Conversations'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of conversations',
        },
        401: { description: 'Unauthorized' },
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
        200: { description: 'Deleted' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
