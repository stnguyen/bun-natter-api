import { Database } from 'bun:sqlite';
import { readdir } from 'node:fs/promises';

const MIGRATION_DIR = `${import.meta.dir}/migrations`;

async function migrateToLatest(database: Database) {
    // Make sure the migrations table exists
    await database.run(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Get last applied migration
    const lastMigration = await database.query(`
        SELECT name FROM migrations ORDER BY id DESC LIMIT 1
    `).get() as { name: string } | null;

    console.log(`Last migration: ${lastMigration?.name}`);

    // Get list of SQL files in the migrations directory
    const migrationFiles = await readdir(MIGRATION_DIR);

    // Only get `.up.sql` files
    const upMigrationFiles = migrationFiles.filter(file => file.endsWith('.up.sql'));
    const upMigrationNames = upMigrationFiles.map(file => file.replace('.up.sql', ''));

    // Get the last applied migration index
    const lastMigrationIndex = lastMigration ? upMigrationNames.indexOf(lastMigration?.name) : -1;

    // Get the next migrations to apply
    const migrationsToApply = upMigrationNames.slice(lastMigrationIndex + 1);
    console.log(`Migrations to apply: ${migrationsToApply.join(', ')}`);

    // Apply the migrations
    const migrationTransaction = database.transaction((name, sql) => {
        console.log(`Applying migration: ${name}. SQL:\n${sql}\n---`);
        database.run(sql);
        database.prepare(`INSERT INTO migrations (name) VALUES ($name)`).run({ $name: name });
        console.log(`Migration applied: ${name}\n---`);
    })
    for (const name of migrationsToApply) {
        const sql = await Bun.file(`${MIGRATION_DIR}/${name}.up.sql`).text();

        try {
            migrationTransaction(name, sql);
        } catch (error) {
            console.error(`Error applying migration: ${name}`);
            console.error(error);
            break;
        }
    }

    console.log('Migration complete!');
}

import sqlitedb from '../src/database.ts';
migrateToLatest(sqlitedb);