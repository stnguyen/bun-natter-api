
import { Database } from "bun:sqlite";

const sqlitedb = new Database("db.sqlite");
export default sqlitedb;