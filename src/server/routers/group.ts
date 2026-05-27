import crypto from "node:crypto";
import { and, eq, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { friendGroup, groupMember, user } from "@/db/schema";
import { protectedProcedure, router } from "@/server/trpc";

export const groupRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const memberships = await ctx.db
      .select({ groupId: groupMember.groupId })
      .from(groupMember)
      .where(eq(groupMember.userId, userId));

    const groupIds = memberships.map((m) => m.groupId);

    const conditions = [eq(friendGroup.creatorId, userId)];
    if (groupIds.length > 0) {
      conditions.push(inArray(friendGroup.id, groupIds));
    }

    const groupsList = await ctx.db
      .select()
      .from(friendGroup)
      .where(or(...conditions));

    if (groupsList.length === 0) return [];

    const activeGroupIds = groupsList.map((g) => g.id);

    const membersData = await ctx.db
      .select({
        groupId: groupMember.groupId,
        memberId: groupMember.userId,
        memberName: user.name,
        memberEmail: user.email,
      })
      .from(groupMember)
      .innerJoin(user, eq(groupMember.userId, user.id))
      .where(inArray(groupMember.groupId, activeGroupIds));

    const membersMap = new Map<
      string,
      Array<{ id: string; name: string; email: string }>
    >();
    for (const m of membersData) {
      if (!membersMap.has(m.groupId)) {
        membersMap.set(m.groupId, []);
      }
      membersMap.get(m.groupId)?.push({
        id: m.memberId,
        name: m.memberName,
        email: m.memberEmail,
      });
    }

    return groupsList.map((g) => ({
      ...g,
      members: membersMap.get(g.id) || [],
    }));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        memberUserIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const groupId = crypto.randomUUID();

      const newGroup = {
        id: groupId,
        name: input.name,
        creatorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(friendGroup).values(newGroup);

      const uniqueMemberIds = Array.from(
        new Set([userId, ...input.memberUserIds]),
      );

      const memberValues = uniqueMemberIds.map((mId) => ({
        id: crypto.randomUUID(),
        groupId,
        userId: mId,
        createdAt: new Date(),
      }));

      if (memberValues.length > 0) {
        await ctx.db.insert(groupMember).values(memberValues);
      }

      return {
        ...newGroup,
        members: uniqueMemberIds,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .delete(friendGroup)
        .where(
          and(
            eq(friendGroup.id, input.groupId),
            eq(friendGroup.creatorId, userId),
          ),
        );

      return { success: true };
    }),
});
