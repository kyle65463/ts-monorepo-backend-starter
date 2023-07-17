export function areErrorsEqual(error1: unknown, error2: unknown): boolean {
  return error1 === error2;
}

export class CustomError extends Error {
  constructor({
    code,
    statusCode,
    message,
  }: {
    code: string;
    statusCode: number;
    message: string;
  }) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }

  public code: string;
  public statusCode: number;
}

export class BadRequestError extends CustomError {
  constructor(code: string, message?: string) {
    super({
      statusCode: 400,
      code: code,
      message: message ?? "Bad request",
    });
  }
}

export class InvalidArgumentError extends BadRequestError {
  constructor() {
    super("I0001", "Invalid argument");
  }
}

export class UnauthorizedError extends CustomError {
  constructor(code?: string) {
    super({
      statusCode: 401,
      code: code ?? "I0002",
      message: "Unauthorized",
    });
  }
}

export class NoPermissionError extends CustomError {
  constructor(code?: string) {
    super({
      statusCode: 403,
      code: code ?? "I0003",
      message: "No permission",
    });
  }
}

export class NotFoundError extends CustomError {
  constructor(code: string, message: string) {
    super({
      statusCode: 404,
      code: code,
      message: message,
    });
  }
}

export class RouteNotFoundError extends NotFoundError {
  constructor() {
    super("I0004", "Route not found");
  }
}

export class InternalServerError extends CustomError {
  constructor() {
    super({
      statusCode: 500,
      code: "I0005",
      message: "Internal server error",
    });
  }
}

export class InvalidResponseError extends CustomError {
  constructor() {
    super({
      statusCode: 500,
      code: "I0006",
      message: "Invalid response",
    });
  }
}

export class NotImplementedError extends CustomError {
  constructor() {
    super({
      statusCode: 501,
      code: "I0007",
      message: "Not implemented",
    });
  }
}
