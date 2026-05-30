export const authSchemas = {
  MessageResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Logged in',
      },
    },
  },

  AuthStatusResponse: {
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            example: 'testuser',
          },
        },
      },
    },
  },
};
