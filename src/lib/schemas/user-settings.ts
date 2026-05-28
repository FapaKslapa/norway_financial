import { z } from "zod";

export const updateUserSettingsSchema = z.object({
  targetMonthlyBudget: z.number().or(z.string()),
  maxMonthlyBudget: z.number().or(z.string()),
  preferredCurrency: z.string().max(3),
  themeMode: z.string().optional(),
  themeAccent: z.string().optional(),
  notifyBudget80: z.boolean().optional(),
  notifyRecurrentApplied: z.boolean().optional(),
  notifyFriendActions: z.boolean().optional(),
});
