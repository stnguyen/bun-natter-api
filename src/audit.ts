import { Database } from "bun:sqlite";
import db from "./database";

// Create audit database with same base name as main database
const auditDbPath = db.filename.replace(".sqlite", ".audit.sqlite");
const auditDb = new Database(auditDbPath);
console.log(`Using audit database: ${auditDbPath}`);

// Initialize audit table with new schema
auditDb.run(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(100) NOT NULL,
    user_id VARCHAR(30) NULL,
    status INT NULL,
    audit_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface AuditLog {
  method: string;
  path: string;
  userId?: string;
  status?: number;
}

export function logAuditEvent(log: AuditLog) {
  const stmt = auditDb.prepare(`
    INSERT INTO audit_logs (
      method,
      path,
      user_id,
      status
    ) VALUES (?, ?, ?, ?)
  `);

  stmt.run(
    log.method,
    log.path,
    log.userId || null,
    log.status || null
  );

  console.log(`Logged audit event: ${log.method} ${log.path} ${log.userId} ${log.status}`);
}

export default auditDb;
