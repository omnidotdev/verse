/**
 * Environment variables.
 */
export const { NODE_ENV } = process.env;

export const isDevEnv = NODE_ENV === "development",
  isProdEnv = NODE_ENV === "production";
