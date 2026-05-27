import { z } from "zod";

export const setCategoryBudgetSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().nonnegative(),
});

export const deleteCategoryBudgetSchema = z.object({
  id: z.string().min(1),
});
