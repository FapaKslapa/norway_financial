import { z } from "zod";

export const listTransactionsSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    type: z.enum(["expense", "income"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .optional();

export const createTransactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number(),
  currency: z.enum(["EUR", "NOK"]),
  exchangeRate: z.number(),
  description: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  date: z.string(),
  sharedWithUserId: z.string().nullable().optional(),
});

export const createManyTransactionsSchema = z.array(
  z.object({
    type: z.enum(["expense", "income"]),
    amount: z.number(),
    currency: z.enum(["EUR", "NOK"]),
    exchangeRate: z.number(),
    description: z.string().optional(),
    categoryId: z.string().uuid().nullable().optional(),
    date: z.string(),
  }),
);

export const deleteTransactionSchema = z.object({
  id: z.string().uuid(),
});
