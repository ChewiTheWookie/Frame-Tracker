import { execSync } from "node:child_process";
import fs from "node:fs";
import { saveLicensesToDb } from "./utils/db";

try {
    console.log("📦 Gathering frontend licenses...");

    const rawData = execSync(`npx license-checker --json`).toString();
    const data = JSON.parse(rawData);

    const formatted = Object.entries(data).map(([key, pkg]: [string, any]) => {
        let licenseText = "";
        if (pkg.licenseFile && fs.existsSync(pkg.licenseFile)) {
            licenseText = fs.readFileSync(pkg.licenseFile, "utf8");
        }

        return {
            id: key,
            name: pkg.licenses || "Unknown",
            version: key.split("@").pop() || "",
            author: pkg.publisher || pkg.author || "",
            repository: pkg.repository || "",
            license_text: licenseText,
        };
    });

    saveLicensesToDb(formatted, "npm");

    console.log("✅ Frontend licenses successfully synced to database.");
} catch (err) {
    console.error("❌ Frontend license sync failed", err);
    process.exit(1);
}
