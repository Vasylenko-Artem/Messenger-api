import {
  assertObjectBody,
  enumValue,
  minLength,
  optionalEmail,
  optionalEnumValue,
  optionalString,
  requireAuthUserId,
  requiredEmail,
  requiredString,
  requiredStringArray,
} from './validators.js';

describe('Validators', () => {
  it('validates object body', () => {
    expect(() => assertObjectBody({})).not.toThrow();
    expect(() => assertObjectBody(null)).toThrow('Validation failed');
    expect(() => assertObjectBody([])).toThrow('Validation failed');
  });

  it('returns authenticated user id', () => {
    expect(requireAuthUserId({ user: { id: 'user-id' } })).toBe('user-id');
    expect(() => requireAuthUserId({})).toThrow('Unauthorized');
  });

  it('validates required strings', () => {
    expect(requiredString(' value ', 'field')).toBe('value');
    expect(() => requiredString('', 'field')).toThrow('Validation failed');
    expect(() => requiredString(1, 'field')).toThrow('Validation failed');
  });

  it('validates optional strings', () => {
    expect(optionalString(undefined, 'field')).toBeUndefined();
    expect(optionalString(' value ', 'field')).toBe('value');
  });

  it('validates emails', () => {
    expect(requiredEmail('test@example.com')).toBe('test@example.com');
    expect(optionalEmail(undefined)).toBeUndefined();
    expect(optionalEmail('test@example.com')).toBe('test@example.com');
    expect(() => requiredEmail('bad-email')).toThrow('Validation failed');
  });

  it('validates minimum length', () => {
    expect(minLength('password', 'password', 6)).toBe('password');
    expect(() => minLength('123', 'password', 6)).toThrow('Validation failed');
  });

  it('validates required string arrays', () => {
    expect(requiredStringArray([' a ', 'b'], 'ids')).toEqual(['a', 'b']);
    expect(() => requiredStringArray([], 'ids')).toThrow('Validation failed');
    expect(() => requiredStringArray([''], 'ids')).toThrow('Validation failed');
  });

  it('validates enum values', () => {
    expect(enumValue('TEXT', 'type', ['TEXT'])).toBe('TEXT');
    expect(optionalEnumValue(undefined, 'type', ['TEXT'])).toBeUndefined();
    expect(optionalEnumValue('TEXT', 'type', ['TEXT'])).toBe('TEXT');
    expect(() => enumValue('IMAGE', 'type', ['TEXT'])).toThrow(
      'Validation failed'
    );
  });
});
