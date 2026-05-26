import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../env";
import * as schema from "./schema";

const poolConnection = mysql.createPool({
  uri: env.DATABASE_URL,
  timezone: "Z",
});

export const db = drizzle({ client: poolConnection, schema, mode: "default" });
export type Database = typeof db;
