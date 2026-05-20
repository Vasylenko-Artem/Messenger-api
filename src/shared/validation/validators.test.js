import { ZodError } from 'zod';

import {
  authValidation,
  conversationsValidation,
  messagesValidation,
  requireAuthUserId,
  usersValidation,
  validate,
  validateBody,
  validateParams,
} from './validators.js';

describe('Validators', () => {
  describe('validate middleware', () => {
    it('calls next() and updates req.body on success', () => {
      const schema = authValidation.login;
      const middleware = validate(schema);
      const req = {
        body: {
          username: ' test ',
          password: ' password ',
        },
      };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({
        username: 'test',
        password: 'password',
      });
    });

    it('calls next() and updates req.params on success', () => {
      const schema = conversationsValidation.idParams;
      const middleware = validate(schema, 'params');
      const req = {
        params: {
          id: ' 9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9 ',
        },
      };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.params).toEqual({
        id: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9',
      });
    });

    it('calls next(error) on validation failure', () => {
      const schema = authValidation.login;
      const middleware = validate(schema);
      const req = {
        body: {
          username: '',
          password: '123',
        },
      };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ZodError));
    });
  });

  it('validates request bodies', () => {
    const req = {
      body: {
        username: ' test ',
        email: 'test@example.com',
        password: 'password',
      },
    };

    expect(validateBody(authValidation.register, req)).toEqual({
      username: 'test',
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('validates request params', () => {
    expect(
      validateParams(messagesValidation.idParams, {
        params: { id: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9' },
      })
    ).toEqual({ id: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9' });
  });

  it('returns authenticated user id', () => {
    expect(requireAuthUserId({ user: { id: 'user-id' } })).toBe('user-id');
    expect(() => requireAuthUserId({})).toThrow('Unauthorized');
  });

  it('validates auth payloads', () => {
    expect(
      authValidation.login.parse({
        username: ' test ',
        password: ' password ',
      })
    ).toEqual({
      username: 'test',
      password: 'password',
    });

    expect(() =>
      authValidation.register.parse({
        username: '',
        email: 'bad-email',
        password: '123',
      })
    ).toThrow(ZodError);
  });

  it('validates user update payloads', () => {
    expect(
      usersValidation.updateMe.parse({
        username: ' new ',
        email: 'new@example.com',
        password: 'new-password',
      })
    ).toEqual({
      username: 'new',
      email: 'new@example.com',
      password: 'new-password',
    });

    expect(() => usersValidation.updateMe.parse({})).toThrow(ZodError);
    expect(() =>
      usersValidation.updateMe.parse({ email: 'bad-email' })
    ).toThrow(ZodError);
  });

  it('validates conversation payloads and params', () => {
    expect(
      conversationsValidation.create.parse({
        type: 'PRIVATE',
        participantIds: [' 9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9 '],
      })
    ).toEqual({
      type: 'PRIVATE',
      participantIds: ['9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9'],
    });

    expect(
      conversationsValidation.addParticipants.parse({
        participantIds: [' 9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9 '],
      })
    ).toEqual({
      participantIds: ['9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9'],
    });

    expect(
      conversationsValidation.idParams.parse({
        id: ' 9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9 ',
      })
    ).toEqual({
      id: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9',
    });

    expect(() =>
      conversationsValidation.create.parse({
        type: 'UNKNOWN',
        participantIds: [],
      })
    ).toThrow(ZodError);
  });

  it('validates message payloads and params', () => {
    expect(
      messagesValidation.create.parse({
        conversationId: ' 9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9 ',
        content: ' hello ',
        type: 'TEXT',
      })
    ).toEqual({
      conversationId: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9',
      content: 'hello',
      type: 'TEXT',
    });

    expect(messagesValidation.update.parse({ content: ' updated ' })).toEqual({
      content: 'updated',
    });

    expect(
      messagesValidation.getByConversationParams.parse({
        conversationId: ' 9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9 ',
      })
    ).toEqual({ conversationId: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9' });

    expect(() =>
      messagesValidation.create.parse({
        conversationId: '',
        content: '',
        type: 'UNKNOWN',
      })
    ).toThrow(ZodError);
  });
});
