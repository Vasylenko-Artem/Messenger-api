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
              $ref: '#/components/schemas/RegisterRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MessageResponse',
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        409: {
          $ref: '#/components/responses/Conflict',
        },
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
              $ref: '#/components/schemas/LoginRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Logged in, tokens set in httpOnly cookies',
          headers: {
            'Set-Cookie': {
              schema: {
                type: 'string',
                example:
                  'accessToken=jwt; HttpOnly; SameSite=Strict, refreshToken=jwt; HttpOnly; SameSite=Strict',
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MessageResponse',
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
      },
    },
  },

  '/auth/refresh': {
    post: {
      summary: 'Refresh access token',
      tags: ['Auth'],
      security: [{ refreshTokenCookie: [] }],
      responses: {
        200: {
          description: 'Tokens refreshed and set in httpOnly cookies',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MessageResponse',
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

  '/auth/logout': {
    post: {
      summary: 'Logout user',
      tags: ['Auth'],
      security: [{ accessTokenCookie: [] }],
      responses: {
        200: {
          description: 'Logged out successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MessageResponse',
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

  '/auth/status': {
    get: {
      summary: 'Get current user status',
      tags: ['Auth'],
      security: [{ accessTokenCookie: [] }],
      responses: {
        200: {
          description: 'User info',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthStatusResponse',
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
};
