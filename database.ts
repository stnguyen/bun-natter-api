
import { Database } from "bun:sqlite";

const db = new Database(":memory:");
export default db;