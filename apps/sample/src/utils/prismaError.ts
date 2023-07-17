import { Prisma } from "@prisma/client";

export enum PrismaError {
  UniqueConstraint = "P2002",
  NotFound = "P2025",
}

const prismaErrors = [PrismaError.UniqueConstraint, PrismaError.NotFound];

/**
 * Transform prisma errors to predefined custom errors and throw the custom error
 * If there are no matched custom errors, return without rethrowing any error
 * @param err - The occurring error
 * @param customErrors - A table that maps prisma errors want to handle to custom errors
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
export function handlePrismaError(
  customErrors: Partial<
    Record<PrismaError, Error | { meta: string; error: Error }>
  >,
) {
  return (err: unknown) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      for (const prismaError of prismaErrors) {
        if (err.code === prismaError) {
          if (!customErrors[prismaError]) continue;

          if (customErrors[prismaError] instanceof Error) {
            throw customErrors[prismaError];
          }
          // TODO: handle meta
          // else if(err.meta) {
          //   throw customErrors[prismaError].error;
          // }
          // const customError = customErrors[prismaError];
          // if (customError) throw customError;
        }
      }
    }
    throw err;
  };
}
