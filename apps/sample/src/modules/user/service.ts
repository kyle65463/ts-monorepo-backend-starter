import { areErrorsEqual, NotFoundError } from "@mantenjp/apikit";
import { CacheClient } from "@mantenjp/cachekit";

import { CacheKey, CacheTTL } from "@/utils/cache";

import { User } from "./models/user";
import { UserRepo, UserRepoErrors } from "./repos/userRepo";
import { UserIdRequest } from "./schema";

export const UserErrors = {
  userNotFound: new NotFoundError("U0001", "User not found"),
};

export const createUserService = ({
  cache,
  userRepo,
}: {
  cache: CacheClient;
  userRepo: UserRepo;
}) => {
  return {
    getUser: async ({ userId }: UserIdRequest): Promise<User> => {
      const user = await cache.getAndSet({
        key: CacheKey.user(userId),
        ttl: CacheTTL.user,
        schema: User,
        getData: async () => {
          const user = await userRepo.getUser(userId).catch((err) => {
            if (areErrorsEqual(err, UserRepoErrors.userNotFound)) {
              throw UserErrors.userNotFound;
            }
            throw err;
          });

          return user;
        },
      });
      return user;
    },
  };
};

export type UserService = ReturnType<typeof createUserService>;
