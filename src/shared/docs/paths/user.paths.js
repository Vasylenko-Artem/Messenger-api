export const userPaths = {
  '/users/me': {
    get: {
      summary: 'Get current user profile',
      tags: ['Users'],
      security: [{ accessTokenCookie: [] }],
      responses: {
        200: {
          description: 'Current user profile',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CurrentUserResponse',
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
      },
    },

    patch: {
      summary: 'Update current user profile',
      tags: ['Users'],
      security: [{ accessTokenCookie: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateUserRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Updated user profile',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CurrentUserResponse',
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
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
      },
    },
  },
};
