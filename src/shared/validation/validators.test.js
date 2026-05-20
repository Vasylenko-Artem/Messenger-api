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
        params: { id: 'message-id' },
      })
    ).toEqual({ id: 'message-id' });
  });

  it('returns authenticated user id', () => {
    expect(requireAuthUserId({ user: { id: 'user-id' } })).toBe('user-id');
    expect(() => requireAuthUserId({})).toThrow('Unauthorized');
  });

  it('validates auth payloads', () => {
    expect(
      validate(authValidation.login, {
        username: ' test ',
        password: ' password ',
      })
    ).toEqual({
      username: 'test',
      password: 'password',
    });

    expect(() =>
      validate(authValidation.register, {
        username: '',
        email: 'bad-email',
        password: '123',
      })
    ).toThrow(ZodError);
  });

  it('validates user update payloads', () => {
    expect(
      validate(usersValidation.updateMe, {
        username: ' new ',
        email: 'new@example.com',
        password: 'new-password',
      })
    ).toEqual({
      username: 'new',
      email: 'new@example.com',
      password: 'new-password',
    });

    expect(() => validate(usersValidation.updateMe, {})).toThrow(ZodError);
    expect(() =>
      validate(usersValidation.updateMe, { email: 'bad-email' })
    ).toThrow(ZodError);
  });

  it('validates conversation payloads and params', () => {
    expect(
      validate(conversationsValidation.create, {
        type: 'PRIVATE',
        participantIds: [' participant-id '],
      })
    ).toEqual({
      type: 'PRIVATE',
      participantIds: ['participant-id'],
    });

    expect(
      validate(conversationsValidation.addParticipants, {
        participantIds: [' user-id '],
      })
    ).toEqual({
      participantIds: ['user-id'],
    });

    expect(validate(conversationsValidation.idParams, { id: 'id' })).toEqual({
      id: 'id',
    });

    expect(() =>
      validate(conversationsValidation.create, {
        type: 'UNKNOWN',
        participantIds: [],
      })
    ).toThrow(ZodError);
  });

  it('validates message payloads and params', () => {
    expect(
      validate(messagesValidation.create, {
        conversationId: ' conversation-id ',
        content: ' hello ',
        type: 'TEXT',
      })
    ).toEqual({
      conversationId: 'conversation-id',
      content: 'hello',
      type: 'TEXT',
    });

    expect(
      validate(messagesValidation.update, { content: ' updated ' })
    ).toEqual({
      content: 'updated',
    });

    expect(
      validate(messagesValidation.getByConversationParams, {
        conversationId: 'conversation-id',
      })
    ).toEqual({ conversationId: 'conversation-id' });

    expect(() =>
      validate(messagesValidation.create, {
        conversationId: '',
        content: '',
        type: 'UNKNOWN',
      })
    ).toThrow(ZodError);
  });
});
