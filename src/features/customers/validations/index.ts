import z from "zod";

export const membershipSchema = z.object({
  membershipId: z.uuid(),
  userId: z.uuid(),
  role: z.string(),
});