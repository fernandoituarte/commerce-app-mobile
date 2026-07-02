import z from "zod";

export const extraSchema = z.object({
  name: z.string(),
  price: z.number().optional(),
});