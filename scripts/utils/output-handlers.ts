import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(
    __dirname,
    "../../src-tauri/resources/licenses.db",
);
const TXT_PATH = path.resolve(__dirname, "../../THIRD_PARTY_LICENSES.txt");

export function generateLicenseTextFile(licenses: any[]) {
    let content =
        "THIRD PARTY LICENSES (FULL COMPLIANCE LIST)\n==========================================\n\n";
    licenses.forEach((pkg) => {
        content += `Package:    ${pkg.id}\nLicense:    ${pkg.name}\nSource:     ${pkg.source}\n`;
        if (pkg.repository) content += `Repository: ${pkg.repository}\n`;
        content += "-".repeat(50) + "\n";
        content += (pkg.license_text || "No license text provided.") + "\n\n";
    });
    fs.writeFileSync(TXT_PATH, content, "utf8");
}

export function saveToDb(licenses: any[]) {
    const db = new Database(DB_PATH);
    db.exec(`CREATE TABLE IF NOT EXISTS licenses (
        id TEXT PRIMARY KEY, name TEXT, version TEXT, author TEXT, 
        repository TEXT, license_text TEXT, source TEXT
    )`);

    db.prepare("DELETE FROM licenses").run();

    const insert = db.prepare(`
        INSERT OR REPLACE INTO licenses (id, name, version, author, repository, license_text, source)
        VALUES (@id, @name, @version, @author, @repository, @license_text, @source)
    `);

    const insertMany = db.transaction((items) => {
        for (const item of items) insert.run(item);
    });

    insertMany(licenses);
    db.close();
}
