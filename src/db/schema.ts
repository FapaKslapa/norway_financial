import {
  boolean,
  decimal,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = mysqlTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: varchar("user_agent", { length: 255 }),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = mysqlTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: varchar("scope", { length: 255 }),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const userSettings = mysqlTable("user_settings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  targetMonthlyBudget: decimal("target_monthly_budget", {
    precision: 10,
    scale: 2,
  }).notNull(),
  maxMonthlyBudget: decimal("max_monthly_budget", {
    precision: 10,
    scale: 2,
  }).notNull(),
  preferredCurrency: varchar("preferred_currency", { length: 3 })
    .notNull()
    .default("NOK"),
  themeMode: varchar("theme_mode", { length: 10 }).notNull().default("dark"),
  themeAccent: varchar("theme_accent", { length: 20 })
    .notNull()
    .default("blue"),
  aiProvider: varchar("ai_provider", { length: 20 }).notNull().default("local"),
  geminiApiKey: varchar("gemini_api_key", { length: 255 }),
  ollamaUrl: varchar("ollama_url", { length: 255 })
    .notNull()
    .default("http://localhost:11434"),
  ollamaModel: varchar("ollama_model", { length: 100 })
    .notNull()
    .default("llama3.2:1b"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const friendGroup = mysqlTable("friend_group", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  creatorId: varchar("creator_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const groupMember = mysqlTable("group_member", {
  id: varchar("id", { length: 36 }).primaryKey(),
  groupId: varchar("group_id", { length: 36 })
    .notNull()
    .references(() => friendGroup.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
});

export const category = mysqlTable("category", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const transaction = mysqlTable("transaction", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id", { length: 36 }).references(
    () => category.id,
    { onDelete: "set null" },
  ),
  type: varchar("type", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  amountEur: decimal("amount_eur", { precision: 10, scale: 2 }).notNull(),
  amountNok: decimal("amount_nok", { precision: 10, scale: 2 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  groupId: varchar("group_id", { length: 36 }).references(
    () => friendGroup.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const todoList = mysqlTable("todo_list", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const todo = mysqlTable("todo", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  todoListId: varchar("todo_list_id", { length: 36 }).references(
    () => todoList.id,
    { onDelete: "cascade" },
  ),
  categoryId: varchar("category_id", { length: 36 }).references(
    () => category.id,
    { onDelete: "set null" },
  ),
  title: varchar("title", { length: 255 }).notNull(),
  notes: text("notes"),
  completed: boolean("completed").notNull().default(false),
  estimatedAmount: decimal("estimated_amount", { precision: 10, scale: 2 }),
  estimatedCurrency: varchar("estimated_currency", { length: 3 }),
  convertedToTransactionId: varchar("converted_to_transaction_id", {
    length: 36,
  }).references(() => transaction.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const friendship = mysqlTable("friendship", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  friendId: varchar("friend_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull(),
  senderId: varchar("sender_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sharedExpense = mysqlTable("shared_expense", {
  id: varchar("id", { length: 36 }).primaryKey(),
  transactionId: varchar("transaction_id", { length: 36 })
    .notNull()
    .references(() => transaction.id, { onDelete: "cascade" }),
  payerId: varchar("payer_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  borrowerId: varchar("borrower_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amountNok: decimal("amount_nok", { precision: 10, scale: 2 }).notNull(),
  splitAmountNok: decimal("split_amount_nok", {
    precision: 10,
    scale: 2,
  }).notNull(),
  settled: boolean("settled").notNull().default(false),
  groupId: varchar("group_id", { length: 36 }).references(
    () => friendGroup.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
