/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { z, ZodSchema } from "zod";

import { CustomError } from "./error";
import { RequestSchema, ResponseSchema } from "./schema";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

/**
 * Register a route to api docs
 */
export function registerRouteToApiDocs(_: {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  request?: RequestSchema;
  response?: ResponseSchema;
  errors?: CustomError[];
}) {
  // TODO: register to api docs
}

/**
 * Register a model schema to api docs
 * @param name - The name of the schema
 * @param schema - The zod schema going to be registered
 */
export function registerModelToApiDocs<T extends ZodSchema<any>>(
  name: string,
  schema: T,
): T {
  registry.register(name, schema);
  return schema;
}
