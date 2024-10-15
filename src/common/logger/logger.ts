import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json } = format;

export const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json(), // Structured logging in JSON format
  ),
  transports: [
    new transports.Console(), // Console logging for serverless environments
  ],
});
