import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  icon: z.string().min(1).max(100),
  color: z.string().min(4).max(7),
});

export const updateCategorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  icon: z.string().min(1).max(100),
  color: z.string().min(4).max(7),
});

export const deleteCategorySchema = z.object({
  id: z.uuid(),
});
