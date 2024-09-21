import { Database } from "bun:sqlite";

const db = new Database("db.sqlite");
export default db;
