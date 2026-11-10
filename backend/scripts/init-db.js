/**
 * Creates/updates the CampusLink database from backend/src/db/*.sql.
 *
 *   npm run db:init        (from backend/)
 *
 * Safe to run on every deploy:
 *  - tables are created only if they don't exist (existing data is kept),
 *  - stored procedures and functions are dropped and re-created, so changes to them are applied.
 *
 * The .sql files use the mysql CLI's DELIMITER directive, which database drivers don't understand,
 * so this script splits the statements itself.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const sqlDir = path.join(__dirname, '../src/db');

// schema.sql creates the tables, so it must run first; the rest only define procedures/functions.
const files = ['schema.sql', ...fs.readdirSync(sqlDir).filter(f => f.endsWith('.sql') && f !== 'schema.sql').sort()];

function splitStatements(sql) {
    const statements = [];
    let delimiter = ';';
    let current = [];

    for (const line of sql.split(/\r?\n/)) {
        const delimiterMatch = line.match(/^\s*DELIMITER\s+(\S+)\s*$/i);
        if (delimiterMatch) {
            delimiter = delimiterMatch[1];
            continue;
        }

        current.push(line);

        // A statement ends when a line (ignoring a trailing "-- comment") ends with the current delimiter.
        const code = line.replace(/--.*$/, '').trimEnd();
        if (code.endsWith(delimiter)) {
            let statement = current.join('\n').trim();
            statement = statement.slice(0, statement.lastIndexOf(delimiter)).trim();
            if (statement.replace(/--.*$/gm, '').trim()) statements.push(statement);
            current = [];
        }
    }

    const rest = current.join('\n').replace(/--.*$/gm, '').trim();
    if (rest) statements.push(rest);

    return statements;
}

function makeIdempotent(statement) {
    // Keep existing tables and their data:
    statement = statement.replace(/CREATE TABLE (?!IF NOT EXISTS)/i, 'CREATE TABLE IF NOT EXISTS ');

    // Re-create routines so the latest version is always installed:
    const routine = statement.match(/CREATE\s+(PROCEDURE|FUNCTION)\s+`?(\w+)`?/i);
    if (routine) {
        return [`DROP ${routine[1].toUpperCase()} IF EXISTS \`${routine[2]}\``, statement];
    }
    return [statement];
}

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    let count = 0;
    for (const file of files) {
        const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
        for (const statement of splitStatements(sql)) {
            for (const query of makeIdempotent(statement)) {
                try {
                    await connection.query(query);
                    count++;
                }
                catch (err) {
                    console.error(`\n✗ Error in ${file}:\n${query.slice(0, 300)}\n`);
                    throw err;
                }
            }
        }
        console.log(`✓ ${file}`);
    }

    await connection.end();
    console.log(`Database ready (${count} statements run).`);
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
