export const userSchemas = {
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'test@example.com',
      },
      username: {
        type: 'string',
        example: 'testuser',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },

  CurrentUserResponse: {
    type: 'object',
    properties: {
      user: {
        $ref: '#/components/schemas/User',
      },
    },
  },

  UpdateUserRequest: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        example: 'newusername',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'new@example.com',
      },
      password: {
        type: 'string',
        format: 'password',
        example: 'new-password',
      },
    },
  },
};
