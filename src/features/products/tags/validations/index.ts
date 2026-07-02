import z from "zod";

export const tagSchema = z.object({
  name: z.string(),
  isActive: z.boolean().default(true),
});