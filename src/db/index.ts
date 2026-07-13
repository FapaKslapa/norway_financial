import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const runtime = "edge";

const getD1 = () => {
  try {
    const ctx = getRequestContext() as any;
    if (ctx?.env?.DB) {
      return drizzle(ctx.env.DB, { schema });
    }
  } catch (e) {
    // Ignore error when outside of request context (e.g. module load or build time)
  }

  // In local node environment (e.g. scripts or build time if not in worker context)
  // we return a dummy drizzle or throw a lazy error if someone tries to query it.
  return new Proxy({} as any, {
    get() {
      throw new Error(
        "D1 Database binding (DB) is not available. Ensure you are running in a Cloudflare worker environment with the binding configured."
      );
    },
  });
};

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop, receiver) {
    const actualDb = getD1();
    const value = Reflect.get(actualDb, prop);
    if (typeof value === "function") {
      return value.bind(actualDb);
    }
    return value;
  },
});

export type Database = ReturnType<typeof drizzle<typeof schema>>;
export * as schema from "./schema";
