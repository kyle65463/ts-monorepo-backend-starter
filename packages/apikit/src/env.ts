import dotenv from "dotenv";

dotenv.config();

export const env = {
  isDebugMode: process.env.IS_DEBUG_MODE !== "0" || false,
  buildNumber: process.env.BUILD_NUMBER || "",
};
