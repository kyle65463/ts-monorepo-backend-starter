import { beforeEach, describe, it } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

import { createServer, ServerInstance } from "@mantenjp/apikit";

import { jsonReviver } from "@/utils/json";

import { User } from "./models/user";
import { createUserRoutes } from "./routes";
import { UserErrors, UserService } from "./service";

const mockUser: User = {
  id: 1,
  email: "test@mail.com",
  name: "user 1",
  age: 18,
  address: "Taipei",
  birthday: new Date(2000, 1, 2),
};

describe("suite", () => {
  let server: ServerInstance;
  let userService: MockProxy<UserService>;

  beforeEach(async () => {
    server = createServer({});
    userService = mock<UserService>();
    server.register(createUserRoutes({ userService }));
    await server.ready();
  });

  describe("get user", () => {
    describe("when succeed", () => {
      beforeEach(async () => {
        userService.getUser.mockReturnValue(Promise.resolve(mockUser));
      });

      it("should return user", async ({ expect }) => {
        const res = await server.inject({
          method: "get",
          url: "/users/1",
        });
        const data = JSON.parse(res.payload, jsonReviver);

        expect(res.statusCode).toBe(200);
        expect(data).toEqual(mockUser);
      });
    });

    describe("when user does not exist", () => {
      beforeEach(async () => {
        userService.getUser.mockReturnValue(
          Promise.reject(UserErrors.userNotFound),
        );
      });

      it("should return 404 error", async ({ expect }) => {
        const res = await server.inject({
          method: "get",
          url: "/users/1",
        });
        const data = JSON.parse(res.payload, jsonReviver);

        expect(res.statusCode).toBe(404);
        expect(data.code).toEqual("U0001");
      });
    });
  });
});
