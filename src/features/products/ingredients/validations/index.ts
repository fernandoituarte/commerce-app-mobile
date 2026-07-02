import z from "zod";

export const ingredientSchema = z.object({
  name: z.string(),
  isActive: z.boolean().optional(),
});