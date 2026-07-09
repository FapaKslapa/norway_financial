import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Devi effettuare il login per procedere",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
const createCallerFactory = t.createCallerFactory;
