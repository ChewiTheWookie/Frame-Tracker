import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, "../src-tauri/resources/licenses.db");
const OUTPUT_PATH = path.resolve(__dirname, "../THIRD_PARTY_LICENSES.txt");

function generateLicenseFile() {
    console.log(`📄 Generating OUTPUT_PATH`);

    if (!fs.existsSync(DB_PATH)) {
        console.error("❌ Database not found. Run the sync scripts first.");
        return;
    }

    const db = new Database(DB_PATH);
    const licenses = db
        .prepare("SELECT * FROM licenses ORDER BY source, id")
        .all();
    db.close();

    let content = "THIRD PARTY LICENSES\n";
    content += "====================\n\n";
    content += "This application uses the following open-source software:\n\n";

    licenses.forEach((pkg: any) => {
        content +=
            "----------------------------------------------------------\n";
        content += `Package:    ${pkg.id}\n`;
        content += `License:    ${pkg.name}\n`;
        if (pkg.repository) content += `Repository: ${pkg.repository}\n`;
        content +=
            "----------------------------------------------------------\n\n";
        content += pkg.license_text || "No license text provided.";
        content += "\n\n";
    });

    fs.writeFileSync(OUTPUT_PATH, content, "utf8");
    console.log(`📜 Generated ${OUTPUT_PATH}`);
}

generateLicenseFile();
