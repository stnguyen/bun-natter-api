import { Database } from "bun:sqlite";

const dbPath =
  process.env.NODE_ENV === "test"
    ? `db.test.${Date.now()}.sqlite`
    : (process.env.DB_PATH || "db.sqlite");
const db = new Database(dbPath);
console.log(`Using database: ${dbPath}`);

export default db;
