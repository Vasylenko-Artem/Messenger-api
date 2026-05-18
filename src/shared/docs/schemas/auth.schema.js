export const authSchemas = {
  RegisterRequest: {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
      username: {
        type: 'string',
        example: 'testuser',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'test@example.com',
      },
      password: {
        type: 'string',
        format: 'password',
        example: '123456',
      },
    },
  },

  LoginRequest: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
        example: 'testuser',
      },
      password: {
        type: 'string',
        format: 'password',
        example: '123456',
      },
    },
  },

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
