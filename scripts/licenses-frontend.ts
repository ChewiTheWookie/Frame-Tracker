import { execSync } from "node:child_process";
import fs from "node:fs";

export async function gatherFrontendLicenses() {
    console.log("\n📦 Gathering frontend licenses...");
    const rawData = execSync(
        `npx license-checker --production --json`,
    ).toString();
    const data = JSON.parse(rawData);

    return Object.entries(data).map(([key, pkg]: [string, any]) => ({
        id: key,
        name: pkg.licenses || "Unknown",
        version: key.split("@").pop() || "",
        author: pkg.publisher || pkg.author || "",
        repository: pkg.repository || "",
        license_text: pkg.licenseFile
            ? fs.readFileSync(pkg.licenseFile, "utf8")
            : "",
        source: "npm",
    }));
}
