import { createRoute, CreateRoutes } from "@mantenjp/apikit";

import { User } from "./models/user";
import { UserIdRequest } from "./schema";
import { UserService } from "./service";

export const createUserRoutes: CreateRoutes<{
  userService: UserService;
}> = ({ userService }) => {
  return async (server) => {
    createRoute({
      server,
      method: "get",
      path: "/users/:userId",
      summary: "Get a user",
      needAuthenticated: false,
      schemas: {
        request: UserIdRequest,
        response: User,
      },
      handler: userService.getUser,
    });
  };
};

// TODO: sentry
// TODO: api docs

// TODO: README
// TODO: env parser
