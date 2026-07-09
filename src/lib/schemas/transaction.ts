import { z } from "zod";

export const listTransactionsSchema = z
  .object({
    categoryId: z.uuid().nullable().optional(),
    type: z.enum(["expense", "income"]).nullable().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    page: z.number().optional().default(1),
    limit: z.number().optional().default(10),
    sortField: z
      .enum(["date", "description", "category", "type", "amount"])
      .optional()
      .default("date"),
    sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .optional();

export const createTransactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number(),
  currency: z.string().length(3),
  exchangeRate: z.number(),
  exchangeRateNok: z.number().optional(),
  description: z.string().optional(),
  categoryId: z.uuid().nullable().optional(),
  date: z.string(),
  sharedWithUserId: z.string().nullable().optional(),
  groupId: z.string().nullable().optional(),
  groupSplits: z
    .array(
      z.object({
        userId: z.string(),
        amountNok: z.number(),
      }),
    )
    .optional(),

  splitMode: z
    .enum(["half", "percentage", "exact", "thirds", "custom_n"])
    .optional()
    .default("half"),

  splitValue: z.number().optional(),
});

export const createManyTransactionsSchema = z.array(
  z.object({
    type: z.enum(["expense", "income"]),
    amount: z.number(),
    currency: z.string().length(3),
    exchangeRate: z.number(),
    exchangeRateNok: z.number().optional(),
    description: z.string().optional(),
    categoryId: z.uuid().nullable().optional(),
    date: z.string(),
  }),
);

export const deleteTransactionSchema = z.object({
  id: z.uuid(),
});

export const updateTransactionSchema = z.object({
  id: z.uuid(),
  type: z.enum(["expense", "income"]),
  amount: z.number(),
  currency: z.string().length(3),
  exchangeRate: z.number(),
  exchangeRateNok: z.number().optional(),
  description: z.string().optional(),
  categoryId: z.uuid().nullable().optional(),
  date: z.string(),
});
