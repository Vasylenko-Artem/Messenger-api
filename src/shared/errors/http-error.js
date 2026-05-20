const errorStatusByMessage = {
  Forbidden: 403,
  Unauthorized: 401,
  'No token': 401,
  'Invalid token': 401,
  'No refresh token': 401,
  'Invalid credentials': 401,
  'Invalid refresh token': 401,
  'User is not logged in': 401,
  'Message not found': 404,
  'Conversation not found': 404,
  'User not found': 404,
};

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const getErrorStatus = (error) => {
  if (error?.statusCode) {
    return error.statusCode;
  }

  return errorStatusByMessage[error?.message] || 400;
};

export const unauthorized = (message = 'Unauthorized') =>
  new HttpError(401, message);
