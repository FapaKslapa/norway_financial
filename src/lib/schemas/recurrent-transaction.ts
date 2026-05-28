import { z } from "zod";

export const recurrentTransactionSchema = z.object({
  categoryId: z.string().nullable().optional(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().min(1),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.string().or(z.date()),
  status: z.enum(["active", "paused"]).optional().default("active"),
  endDate: z.string().or(z.date()).nullable().optional(),
});

export const deleteRecurrentTransactionSchema = z.object({
  id: z.string().min(1),
});
