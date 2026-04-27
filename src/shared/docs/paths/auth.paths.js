export const authPaths = {
  '/auth/register': {
    post: {
      summary: 'Register new user',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string', example: 'testuser' },
                password: { type: 'string', example: '123456' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'User registered successfully' },
        400: { description: 'Bad request' },
      },
    },
  },

  '/auth/login': {
    post: {
      summary: 'Login user',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Logged in, tokens set in cookies' },
        401: { description: 'Invalid credentials' },
      },
    },
  },

  '/auth/refresh': {
    post: {
      summary: 'Refresh access token',
      tags: ['Auth'],
      responses: {
        200: { description: 'Token refreshed' },
        401: { description: 'No or invalid refresh token' },
      },
    },
  },

  '/auth/logout': {
    post: {
      summary: 'Logout user',
      tags: ['Auth'],
      responses: {
        200: { description: 'Logged out successfully' },
      },
    },
  },

  '/auth/status': {
    get: {
      summary: 'Get current user status',
      tags: ['Auth'],
      responses: {
        200: {
          description: 'User info',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      username: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Not authenticated' },
      },
    },
  },
};
