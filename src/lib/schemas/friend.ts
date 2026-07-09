import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  email: z.email(),
});

export const respondFriendRequestSchema = z.object({
  requestId: z.string(),
  action: z.enum(["accept", "decline"]),
});

export const settleDebtSchema = z.object({
  friendId: z.string(),
});
