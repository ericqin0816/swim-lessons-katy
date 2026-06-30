import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const migrationPath = path.join(root, "supabase", "schema.sql");

if (!fs.existsSync(envPath)) {
  throw new Error(".env.local is missing.");
}

const envText = fs.readFileSync(envPath, "utf8");
for (const line of envText.split(/\r?\n/)) {
  if (!line || /^\s*#/.test(line) || !line.includes("=")) {
    continue;
  }

  const index = line.indexOf("=");
  const key = line.slice(0, index).trim();
  const value = line
    .slice(index + 1)
    .trim()
    .replace(/^['"]|['"]$/g, "");

  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const connectionString = process.env.DB_CONNECTION_STRING;
if (!connectionString) {
  throw new Error("DB_CONNECTION_STRING is missing from .env.local.");
}

const migration = fs.readFileSync(migrationPath, "utf8");
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(migration);
  console.log("Migration applied successfully.");
} catch (error) {
  console.error(`Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
