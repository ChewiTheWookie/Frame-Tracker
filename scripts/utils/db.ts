import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { isBlacklisted } from "./blacklist";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(
    __dirname,
    "../../src-tauri/resources/licenses.db",
);
const MIGRATION_PATH = path.resolve(
    __dirname,
    "../../src-tauri/migrations/license",
);

export function saveLicensesToDb(licenses: any[], source: "npm" | "cargo") {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const db = new Database(DB_PATH);

    if (fs.existsSync(MIGRATION_PATH)) {
        const files = fs
            .readdirSync(MIGRATION_PATH)
            .filter((f) => f.endsWith(".sql"))
            .sort();
        for (const file of files) {
            const sql = fs.readFileSync(
                path.join(MIGRATION_PATH, file),
                "utf8",
            );
            db.exec(sql);
        }
    }

    db.prepare("DELETE FROM licenses WHERE source = ?").run(source);

    const insert = db.prepare(`
        INSERT OR REPLACE INTO licenses (id, name, version, author, repository, license_text, source)
        VALUES (@id, @name, @version, @author, @repository, @license_text, @source)
    `);

    const insertMany = db.transaction((items) => {
        for (const item of items) {
            if (!isBlacklisted(item.id)) {
                insert.run(item);
            }
        }
    });

    const preparedItems = licenses.map((item) => ({ ...item, source }));
    insertMany(preparedItems);

    db.close();
    console.log(
        `✅ Successfully synced ${licenses.length} ${source} licenses.`,
    );
}
