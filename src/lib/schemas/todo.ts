import { z } from "zod";

export const createTodoListSchema = z.object({
  name: z.string().min(1).max(255),
});

export const deleteTodoListSchema = z.object({
  id: z.uuid(),
});

export const listTodoSchema = z.object({
  todoListId: z.uuid(),
});

export const createTodoSchema = z.object({
  todoListId: z.uuid(),
  title: z.string().min(1).max(255),
  notes: z.string().optional(),
  categoryId: z.uuid().nullable().optional(),
  estimatedAmount: z.number().optional(),
  estimatedCurrency: z.string().length(3).optional(),
});

export const toggleTodoSchema = z.object({
  id: z.uuid(),
  completed: z.boolean(),
});

export const deleteTodoSchema = z.object({
  id: z.uuid(),
});

export const convertToTransactionSchema = z.object({
  todoId: z.uuid(),
  amount: z.number(),
  currency: z.string().length(3),
  exchangeRate: z.number(),
  date: z.string(),
});

export const convertToTransactionBulkSchema = z.object({
  todoIds: z.array(z.uuid()),
  amount: z.number(),
  currency: z.string().length(3),
  exchangeRate: z.number(),
  date: z.string(),
  description: z.string(),
  categoryId: z.uuid().nullable().optional(),
});
