import { PrismaClient } from "@prisma/client";

import { createServer, logger } from "@mantenjp/apikit";
import { createCacheClient } from "@mantenjp/cachekit";

import { createUserRepo } from "@/modules/user/repos/userRepo";
import { createUserRoutes } from "@/modules/user/routes";
import { createUserService } from "@/modules/user/service";
import { env } from "@/utils/env";

const server = createServer({ healthCheckPath: "/health" });

const db = new PrismaClient();
const cache = createCacheClient({
  redisOptions: {
    host: env.redisHost,
    password: env.redisPassword,
    db: env.redisDbIndex,
  },
});

server.register(
  createUserRoutes({
    userService: createUserService({
      userRepo: createUserRepo(db),
      cache,
    }),
  }),
);

const startServer = async () => {
  try {
    const port = 8080;
    await server.listen({ port });
    logger.info(`Server started on port ${port}`);
  } catch (err) {
    logger.error("Server started failed");
    logger.error(err);
    process.exit(1);
  }
};

startServer();
