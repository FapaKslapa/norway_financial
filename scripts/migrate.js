const { drizzle } = require("drizzle-orm/mysql2");
const mysql = require("mysql2/promise");
const { migrate } = require("drizzle-orm/mysql2/migrator");
const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log("Connecting to database at:", maskedUrl);

  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  let migrationsFolder = path.join(__dirname, "migrations");
  if (!fs.existsSync(migrationsFolder)) {
    migrationsFolder = path.join(__dirname, "../src/db/migrations");
  }

  console.log("Applying migrations from:", migrationsFolder);

  await migrate(db, { migrationsFolder });
  await connection.end();
  console.log("Migrations applied successfully!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
