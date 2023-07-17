import { z } from "zod";

export const User = z.object({
  id: z.number().int(),
  email: z.string().email(),
  name: z.string(),
  age: z.number().int(),
  address: z.string(),
  birthday: z.date(),
});

export type User = z.infer<typeof User>;
