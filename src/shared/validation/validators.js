import { ValidationError, unauthorized } from '../errors/http-error.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const assertObjectBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Validation failed', [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }
};

export const requireAuthUserId = (req) => {
  const id = req.user?.id;

  if (!id) {
    throw unauthorized();
  }

  return id;
};

export const requiredString = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError('Validation failed', [
      { field, message: `${field} is required` },
    ]);
  }

  return value.trim();
};

export const optionalString = (value, field) => {
  if (value === undefined) {
    return undefined;
  }

  return requiredString(value, field);
};

export const requiredEmail = (value, field = 'email') => {
  const email = requiredString(value, field);

  if (!emailPattern.test(email)) {
    throw new ValidationError('Validation failed', [
      { field, message: `${field} must be a valid email` },
    ]);
  }

  return email;
};

export const optionalEmail = (value, field = 'email') => {
  if (value === undefined) {
    return undefined;
  }

  return requiredEmail(value, field);
};

export const minLength = (value, field, min) => {
  if (value.length < min) {
    throw new ValidationError('Validation failed', [
      { field, message: `${field} must be at least ${min} characters` },
    ]);
  }

  return value;
};

export const requiredStringArray = (value, field) => {
  if (!Array.isArray(value) || value.length < 1) {
    throw new ValidationError('Validation failed', [
      { field, message: `${field} must be a non-empty array` },
    ]);
  }

  return value.map((item, index) => requiredString(item, `${field}.${index}`));
};

export const enumValue = (value, field, allowedValues) => {
  if (!allowedValues.includes(value)) {
    throw new ValidationError('Validation failed', [
      {
        field,
        message: `${field} must be one of: ${allowedValues.join(', ')}`,
      },
    ]);
  }

  return value;
};

export const optionalEnumValue = (value, field, allowedValues) => {
  if (value === undefined) {
    return undefined;
  }

  return enumValue(value, field, allowedValues);
};
