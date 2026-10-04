require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function runMigrations() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                name TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        const migrationsDirectory = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDirectory)
            .filter((file) => /^\d+_.+\.sql$/.test(file))
            .sort();

        for (const file of migrationFiles) {
            const applied = await client.query(
                'SELECT 1 FROM schema_migrations WHERE name = $1',
                [file]
            );
            if (applied.rowCount > 0) continue;

            const sql = fs.readFileSync(path.join(migrationsDirectory, file), 'utf8');
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query(
                    'INSERT INTO schema_migrations (name) VALUES ($1)',
                    [file]
                );
                await client.query('COMMIT');
                console.log(`Applied migration: ${file}`);
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations().catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
});
