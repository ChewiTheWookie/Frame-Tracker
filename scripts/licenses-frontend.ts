import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const OUTPUT = "./src/assets/npm-licenses.json";

try {
    console.log("📦 Gathering frontend licenses...");

    execSync(`license-checker --json --out ${OUTPUT}`, { stdio: "inherit" });

    const data = JSON.parse(fs.readFileSync(OUTPUT, "utf8"));

    for (const key in data) {
        const pkg = data[key];
        if (pkg.licenseFile && fs.existsSync(pkg.licenseFile)) {
            pkg.licenseText = fs.readFileSync(pkg.licenseFile, "utf8");
        }
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
    console.log("✅ Updated: npm-licenses.json with full text");
} catch (err) {
    console.error("❌ Frontend license sync failed");
    process.exit(1);
}
