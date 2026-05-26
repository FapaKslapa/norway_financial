import { z } from "zod";

export const createTodoListSchema = z.object({
  name: z.string().min(1).max(255),
});

export const deleteTodoListSchema = z.object({
  id: z.string().uuid(),
});

export const listTodoSchema = z.object({
  todoListId: z.string().uuid(),
});

export const createTodoSchema = z.object({
  todoListId: z.string().uuid(),
  title: z.string().min(1).max(255),
  notes: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  estimatedAmount: z.number().optional(),
  estimatedCurrency: z.enum(["EUR", "NOK"]).optional(),
});

export const toggleTodoSchema = z.object({
  id: z.string().uuid(),
  completed: z.boolean(),
});

export const deleteTodoSchema = z.object({
  id: z.string().uuid(),
});

export const convertToTransactionSchema = z.object({
  todoId: z.string().uuid(),
  amount: z.number(),
  currency: z.enum(["EUR", "NOK"]),
  exchangeRate: z.number(),
  date: z.string(),
});
