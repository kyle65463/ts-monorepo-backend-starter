/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FastifyInstance } from "fastify";
import { ZodSchema } from "zod";

import { CustomError } from "./error";
import { registerRouteToApiDocs } from "./openapi";
import { RequestSchema, ResponseSchema } from "./schema";
import { validateRequest, validateResponse } from "./validation";

export type CreateRoutes<T> = (
  services: T,
) => (server: FastifyInstance) => Promise<void>;

/**
 * HTTP methods.
 */
type Method = "get" | "post" | "patch" | "delete" | "put";

interface CreateRouteProps<TParams, TQuery, TBody, TResponse> {
  /**
   * The express router to handle the route.
   */
  server: FastifyInstance;

  /**
   * The base path, for registering api docs only by concatenating with path, defaults to "".
   * @example /auth
   */
  basePath?: string;

  /**
   * The path after base path, for registering express router and api docs, e.g. /login/email.
   * @example /login/email
   */
  path: string;

  /**
   * The HTTP method.
   */
  method: Method;

  /**
   * A brief description of the route to display on api docs.
   */
  summary?: string;

  /**
   * A full description of the route to display on api docs.
   */
  description?: string;

  /**
   * A list of tags to display on api docs.
   */
  tags?: string[];

  /**
   * If the request needs to be authenticated to access by checking the auth token on the header, defaults to true.
   * Notes: if true, it will be handled by isAuthenticated middleware.
   */
  needAuthenticated?: boolean;

  /**
   * Schemas to validate payload of request and response.
   * Notes: if not undefined, it will be handled by validateRequestMiddleware and validateResponseMiddleware.
   */
  schemas: {
    request: RequestSchema<TParams, TQuery, TBody>;
    response: ResponseSchema<TResponse> | ResponseSchema<TResponse>["schema"];
  };

  errors?: CustomError[];

  /**
   * The request handler.
   */
  handler: (params: TParams & TQuery & TBody) => Promise<TResponse> | TResponse;
}

/**
 * Create a route with handler, and register it to api docs by request and response schemas automatically.
 */
export function createRoute<TParams, TQuery, TBody, TResponse>({
  server,
  basePath = "",
  path,
  method,
  summary,
  description,
  tags,
  // needAuthenticated = true,
  schemas: { request: requestSchema, response },
  errors = [],
  handler,
}: CreateRouteProps<TParams, TQuery, TBody, TResponse>) {
  const responseSchema =
    response instanceof ZodSchema ? response : response.schema;
  const responseStatusCode =
    response instanceof ZodSchema ? 200 : response.statusCode;

  registerRouteToApiDocs({
    method,
    path: basePath + path,
    description,
    summary,
    tags,
    request: requestSchema,
    response: { schema: responseSchema, statusCode: responseStatusCode },
    errors,
  });

  server.route({
    method,
    url: path,
    handler: async (request, reply) => {
      // TODO: handle authentication
      const params = validateRequest(request, requestSchema);
      const res = await handler(params);
      const validatedResponse = validateResponse(res, responseSchema);
      reply.status(responseStatusCode).send(validatedResponse);
    },
  });
}
