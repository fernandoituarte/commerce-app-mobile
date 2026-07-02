import z from "zod";

export const orgProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contactEmail: z.email("Invalid email address"),
  contactPhone: z.string().min(7, "Phone number is too short"),
});