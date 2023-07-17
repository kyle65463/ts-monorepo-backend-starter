/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodSchema } from "zod";

export type RequestSchema<TParams = any, TQuery = any, TBody = any> = {
  params?: ZodSchema<TParams>;
  query?: ZodSchema<TQuery>;
  body?: ZodSchema<TBody>;
};

export type MergeRequestProps<T extends RequestSchema> =
  (T["params"] extends ZodSchema<infer TParams> ? TParams : unknown) &
    (T["body"] extends ZodSchema<infer TBody> ? TBody : unknown) &
    (T["query"] extends ZodSchema<infer TQuery> ? TQuery : unknown);

export type ResponseSchema<TResponse = any> = {
  statusCode: number;
  schema: ZodSchema<TResponse>;
};
