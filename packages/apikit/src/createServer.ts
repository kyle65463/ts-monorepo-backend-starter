import fastify, { FastifyInstance } from "fastify";

import { env } from "./env";
import {
  CustomError,
  InternalServerError,
  InvalidResponseError,
  RouteNotFoundError,
} from "./error";
import { logger } from "./logger";

export type ServerInstance = FastifyInstance;

interface CreateServerOptions {
  healthCheckPath?: string;
}

export function createServer({ healthCheckPath }: CreateServerOptions = {}) {
  const server = fastify();

  if (healthCheckPath) {
    server.get(healthCheckPath, async () => "ok");
  }

  server.setNotFoundHandler(() => {
    throw new RouteNotFoundError();
  });

  server.setErrorHandler((error, _, reply) => {
    logger.error({
      error: error instanceof Error ? error.stack : error,
    });

    if (!(error instanceof CustomError)) {
      error = new InternalServerError();
    }

    if (error instanceof InvalidResponseError && !env.isDebugMode) {
      error = new InternalServerError();
    }

    const { message, code, statusCode } = error as CustomError;
    reply.status(statusCode).send({ code, message });
  });

  return server;
}
