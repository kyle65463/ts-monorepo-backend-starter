import { z } from "zod";

import { MergeRequestProps } from "@mantenjp/apikit";

export const UserIdRequest = {
  params: z.object({
    userId: z.coerce.number(),
  }),
};

export type UserIdRequest = MergeRequestProps<typeof UserIdRequest>;
