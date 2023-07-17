import { beforeAll, beforeEach, describe, it } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

import { CacheClient, createCacheClient } from "@mantenjp/cachekit";

import { CacheKey } from "@/utils/cache";
import { env } from "@/utils/env";

import { User } from "./models/user";
import { UserRepo, UserRepoErrors } from "./repos/userRepo";
import { createUserService, UserErrors, UserService } from "./service";

const mockUser: User = {
  id: 1,
  email: "test@mail.com",
  name: "user 1",
  age: 18,
  address: "Taipei",
  birthday: new Date(2000, 1, 2),
};

describe("UserService", () => {
  let cache: CacheClient;
  let userRepo: MockProxy<UserRepo>;
  let userService: UserService;

  beforeAll(async () => {
    cache = createCacheClient({
      redisOptions: {
        host: env.redisHost,
        password: env.redisPassword,
        db: env.redisDbIndex,
      },
    });
    userRepo = mock<UserRepo>();
    userService = createUserService({
      cache,
      userRepo,
    });
  });

  beforeEach(async () => {
    await cache.flushAll();
  });

  describe("getUser", () => {
    describe("when user is in cache", () => {
      beforeEach(async () => {
        await cache.set(CacheKey.user(1), mockUser);
      });

      it("should return user", async ({ expect }) => {
        const user = await userService.getUser({ userId: 1 });
        expect(user).toEqual(mockUser);
      });
    });

    describe("when user is not in cache", () => {
      describe("when user is in db", () => {
        beforeEach(async () => {
          userRepo.getUser.mockReturnValue(Promise.resolve(mockUser));
        });

        it("should return user", async ({ expect }) => {
          const user = await userService.getUser({ userId: 1 });
          expect(user).toEqual(mockUser);
        });

        it("should set user in cache", async ({ expect }) => {
          await userService.getUser({ userId: 1 });
          const user = await cache.get(CacheKey.user(1));
          expect(user).toEqual(mockUser);
        });
      });

      describe("when user is not in db", () => {
        beforeEach(async () => {
          userRepo.getUser.mockRejectedValue(UserRepoErrors.userNotFound);
        });

        it("should return user", async ({ expect }) => {
          await expect(userService.getUser({ userId: 1 })).rejects.toThrowError(
            UserErrors.userNotFound,
          );
        });
      });
    });
  });
});
