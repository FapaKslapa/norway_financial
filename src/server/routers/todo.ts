import crypto from "node:crypto";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { todo, todoList, transaction } from "@/db/schema";
import {
  convertToTransactionSchema,
  createTodoListSchema,
  createTodoSchema,
  deleteTodoListSchema,
  deleteTodoSchema,
  listTodoSchema,
  toggleTodoSchema,
} from "@/lib/schemas/todo";
import { protectedProcedure, router } from "@/server/trpc";

function convertAmounts(
  amount: number,
  currency: string,
  exchangeRate: number,
) {
  if (currency === "EUR") {
    return { amountEur: amount, amountNok: amount * exchangeRate };
  }
  return { amountNok: amount, amountEur: amount / exchangeRate };
}

export const todoRouter = router({
  listLists: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    let lists = await ctx.db
      .select()
      .from(todoList)
      .where(eq(todoList.userId, userId));

    if (lists.length === 0) {
      const defaultList = {
        id: crypto.randomUUID(),
        userId,
        name: "Spesa",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(todoList).values(defaultList);

      await ctx.db
        .update(todo)
        .set({ todoListId: defaultList.id })
        .where(and(eq(todo.userId, userId), isNull(todo.todoListId)));

      lists = [defaultList];
    }

    const activeTodos = await ctx.db
      .select({ id: todo.id, todoListId: todo.todoListId })
      .from(todo)
      .where(and(eq(todo.userId, userId), eq(todo.completed, false)));

    const countMap = activeTodos.reduce(
      (acc, t) => {
        if (t.todoListId) {
          acc[t.todoListId] = (acc[t.todoListId] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return lists.map((l) => ({
      ...l,
      activeCount: countMap[l.id] || 0,
    }));
  }),

  createList: protectedProcedure
    .input(createTodoListSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const newList = {
        id: crypto.randomUUID(),
        userId,
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(todoList).values(newList);
      return newList;
    }),

  deleteList: protectedProcedure
    .input(deleteTodoListSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .delete(todoList)
        .where(and(eq(todoList.id, input.id), eq(todoList.userId, userId)));

      return { success: true };
    }),

  list: protectedProcedure
    .input(listTodoSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.db
        .select()
        .from(todo)
        .where(
          and(eq(todo.userId, userId), eq(todo.todoListId, input.todoListId)),
        )
        .orderBy(asc(todo.completed), desc(todo.createdAt));
    }),

  create: protectedProcedure
    .input(createTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const newTodo = {
        id: crypto.randomUUID(),
        userId,
        todoListId: input.todoListId,
        categoryId: input.categoryId || null,
        title: input.title,
        notes: input.notes || "",
        completed: false,
        estimatedAmount:
          input.estimatedAmount !== undefined
            ? input.estimatedAmount.toFixed(2)
            : null,
        estimatedCurrency: input.estimatedCurrency || null,
        convertedToTransactionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(todo).values(newTodo);
      return newTodo;
    }),

  toggle: protectedProcedure
    .input(toggleTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .update(todo)
        .set({ completed: input.completed, updatedAt: new Date() })
        .where(and(eq(todo.id, input.id), eq(todo.userId, userId)));

      return { id: input.id, completed: input.completed };
    }),

  delete: protectedProcedure
    .input(deleteTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .delete(todo)
        .where(and(eq(todo.id, input.id), eq(todo.userId, userId)));

      return { success: true };
    }),

  convertToTransaction: protectedProcedure
    .input(convertToTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existingTodo = await ctx.db
        .select()
        .from(todo)
        .where(and(eq(todo.id, input.todoId), eq(todo.userId, userId)))
        .limit(1);

      if (existingTodo.length === 0) {
        throw new Error("Elemento to-do non trovato o non autorizzato");
      }

      const item = existingTodo[0];
      const { amountEur, amountNok } = convertAmounts(
        input.amount,
        input.currency,
        input.exchangeRate,
      );

      const newTransactionId = crypto.randomUUID();

      const newTransaction = {
        id: newTransactionId,
        userId,
        categoryId: item.categoryId,
        type: "expense",
        amount: input.amount.toFixed(2),
        currency: input.currency,
        amountEur: amountEur.toFixed(2),
        amountNok: amountNok.toFixed(2),
        exchangeRate: input.exchangeRate.toFixed(4),
        description: item.title,
        date: new Date(input.date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(transaction).values(newTransaction);

      await ctx.db
        .update(todo)
        .set({
          completed: true,
          convertedToTransactionId: newTransactionId,
          updatedAt: new Date(),
        })
        .where(eq(todo.id, input.todoId));

      return {
        transaction: newTransaction,
        todoId: input.todoId,
        completed: true,
      };
    }),
});
