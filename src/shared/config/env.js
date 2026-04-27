const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }
  return value;
};

export const env = {
  PORT: requireEnv('PORT'),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_ACCES_TOKEN_TTL: requireEnv('JWT_ACCES_TOKEN_TTL'),
  JWT_REFRESH_TOKEN_TTL: requireEnv('JWT_REFRESH_TOKEN_TTL'),
};
