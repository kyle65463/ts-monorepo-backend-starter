import { FastifyRequest } from "fastify";
import { ZodError, ZodSchema } from "zod";

import { InvalidArgumentError, InvalidResponseError } from "./error";
import { logger } from "./logger";
import { RequestSchema } from "./schema";

/**
 * Validate request params, query and body using zod schemas. Throw an invalid request error if the
 * request is invalid.
 */
export function validateRequest<TParams, TQuery, TBody>(
  req: FastifyRequest,
  { params, query, body }: RequestSchema<TParams, TQuery, TBody>,
): TParams & TQuery & TBody {
  // TODO: Block same property names in params, query and body
  const zodErrors: ZodError[] = [];
  if (params) {
    const parsed = params.safeParse(req.params);
    if (!parsed.success) {
      zodErrors.push(parsed.error);
    }
  }
  if (query) {
    const parsed = query.safeParse(req.query);
    if (!parsed.success) {
      zodErrors.push(parsed.error);
    }
  }
  if (body) {
    const parsed = body.safeParse(req.body);
    if (!parsed.success) {
      zodErrors.push(parsed.error);
    }
  }
  if (zodErrors.length > 0) {
    logger.error(zodErrors);
    throw new InvalidArgumentError();
  }

  return {
    ...(req.params as TParams),
    ...(req.query as TQuery),
    ...(req.body as TBody),
  };
}

export function validateResponse<TResponse>(
  data: TResponse,
  schema: ZodSchema<TResponse>,
): TResponse {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new InvalidResponseError();
  }
  return data;
}
