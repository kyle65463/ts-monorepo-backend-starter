import dotenv from "dotenv";

dotenv.config();

export const env = {
  isDebugMode: process.env.IS_DEBUG_MODE || false,
  buildNumber: process.env.BUILD_NUMBER || "",
  redisHost: process.env.REDIS_HOST || "",
  redisPassword: process.env.REDIS_PASSWD || "",
  redisDbIndex: Number(process.env.REDIS_DB_INDEX || "0"),
};
