import pino from "pino";
import { ENV } from "./env";

/**
 * Structured logger using Pino
 *
 * Usage:
 * - logger.info({ userId, action }, 'User performed action')
 * - logger.error({ err, context }, 'Error occurred')
 * - logger.warn({ missingField }, 'Missing required field')
 * - logger.debug({ data }, 'Debug information')
 */
export const logger = pino({
  level: ENV.isProduction ? "info" : "debug",
  transport: ENV.isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
});

/**
 * Create a child logger with additional context
 * @param context - Additional context to include in all log messages
 * @example
 * const reqLogger = createLogger({ requestId: req.id });
 * reqLogger.info('Processing request');
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
