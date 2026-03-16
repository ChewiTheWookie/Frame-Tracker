import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

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
            .filter((file) => file.endsWith(".sql"))
            .sort();

        for (const file of files) {
            const sql = fs.readFileSync(
                path.join(MIGRATION_PATH, file),
                "utf8",
            );
            db.exec(sql);
            console.log(`🛠️  Applied migration: ${file}`);
        }
    } else {
        console.warn("⚠️  Migration directory not found!");
    }

    const insert = db.prepare(`
    INSERT OR REPLACE INTO licenses (id, name, version, author, repository, license_text, source)
    VALUES (@id, @name, @version, @author, @repository, @license_text, @source)
`);

    const preparedItems = licenses.map((item) => ({
        ...item,
        source: source,
    }));

    const insertMany = db.transaction((items) => {
        for (const item of items) insert.run(item);
    });

    insertMany(preparedItems);
    db.close();
}
