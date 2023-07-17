import winston from "winston";

import { env } from "./env";

/**
 * @see https://www.npmjs.com/package/winston
 * @see https://ithelp.ithome.com.tw/articles/10255101
 */
export const logger = winston.createLogger({
  level: "info",
  defaultMeta: { buildNumber: env.buildNumber },
});

if (env.isDebugMode) {
  logger.add(
    new winston.transports.Console({
      // e.g. info: 2023-01-18T07:53:19.033Z "Listening to port 8080 in local environment"
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize({}),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${level}: ${timestamp}\n ${
            message.error ?? JSON.stringify(message, null, 2)
          }`;
        }),
      ),
      eol: "\n",
    }),
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: winston.format.json(),
      silent: true, // TODO: update the logic
    }),
  );
}
