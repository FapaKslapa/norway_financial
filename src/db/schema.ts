import {
  integer,
  numeric,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const userSettings = sqliteTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  targetMonthlyBudget: numeric("target_monthly_budget").notNull(),
  maxMonthlyBudget: numeric("max_monthly_budget").notNull(),
  preferredCurrency: text("preferred_currency").notNull().default("NOK"),
  themeMode: text("theme_mode").notNull().default("dark"),
  themeAccent: text("theme_accent").notNull().default("blue"),
  aiProvider: text("ai_provider").notNull().default("local"),
  geminiApiKey: text("gemini_api_key"),
  ollamaUrl: text("ollama_url").notNull().default("http://localhost:11434"),
  ollamaModel: text("ollama_model").notNull().default("llama3.2:1b"),
  notifyBudget80: integer("notify_budget_80", { mode: "boolean" }).notNull().default(true),
  notifyRecurrentApplied: integer("notify_recurrent_applied", { mode: "boolean" }).notNull().default(true),
  notifyFriendActions: integer("notify_friend_actions", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const friendGroup = sqliteTable("friend_group", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const groupMember = sqliteTable("group_member", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => friendGroup.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const category = sqliteTable("category", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const transaction = sqliteTable("transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(
    () => category.id,
    { onDelete: "set null" },
  ),
  type: text("type").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull(),
  amountEur: numeric("amount_eur").notNull(),
  amountNok: numeric("amount_nok").notNull(),
  exchangeRate: numeric("exchange_rate").notNull(),
  description: text("description"),
  date: integer("date", { mode: "timestamp" }).notNull(),
  groupId: text("group_id").references(
    () => friendGroup.id,
    { onDelete: "set null" },
  ),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const todoList = sqliteTable("todo_list", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const todo = sqliteTable("todo", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  todoListId: text("todo_list_id").references(
    () => todoList.id,
    { onDelete: "cascade" },
  ),
  categoryId: text("category_id").references(
    () => category.id,
    { onDelete: "set null" },
  ),
  title: text("title").notNull(),
  notes: text("notes"),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  estimatedAmount: numeric("estimated_amount"),
  estimatedCurrency: text("estimated_currency"),
  convertedToTransactionId: text("converted_to_transaction_id").references(() => transaction.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const friendship = sqliteTable("friendship", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  friendId: text("friend_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const sharedExpense = sqliteTable("shared_expense", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transaction.id, { onDelete: "cascade" }),
  payerId: text("payer_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  borrowerId: text("borrower_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amountNok: numeric("amount_nok").notNull(),
  splitAmountNok: numeric("split_amount_nok").notNull(),
  settled: integer("settled", { mode: "boolean" }).notNull().default(false),
  groupId: text("group_id").references(
    () => friendGroup.id,
    { onDelete: "set null" },
  ),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const categoryBudget = sqliteTable("category_budget", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const notification = sqliteTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  link: text("link"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const recurrentTransaction = sqliteTable("recurrent_transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(
    () => category.id,
    { onDelete: "set null" },
  ),
  type: text("type").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull().default("EUR"),
  description: text("description").notNull(),
  frequency: text("frequency").notNull(),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  nextOccurrence: integer("next_occurrence", { mode: "timestamp" }).notNull(),
  lastExecuted: integer("last_executed", { mode: "timestamp" }),
  status: text("status").notNull().default("active"),
  endDate: integer("end_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
