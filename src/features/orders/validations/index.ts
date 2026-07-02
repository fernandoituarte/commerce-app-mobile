import z from "zod";

export const orderSchema = z.object({});

export const posOrderSchema = z.object({
  customerName: z.string().trim().optional(),
});

export type PosOrderFormValues = z.infer<typeof posOrderSchema>;