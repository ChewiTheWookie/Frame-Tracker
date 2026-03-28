import { execSync } from "child_process";
import { saveLicensesToDb } from "./utils/db";

try {
    console.log("🦀 Generating Rust licenses using about.hbs template...");

    const rawOutput = execSync("cargo about generate about.hbs", {
        cwd: "./src-tauri",
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 50,
    });

    const data = JSON.parse(rawOutput);
    const formatted: any[] = [];

    if (!Array.isArray(data)) {
        throw new Error("Expected a flat JSON array from about.hbs output.");
    }

    for (const item of data) {
        const crateName = item.name;
        const crateVersion = item.version;
        const licenseSpdx = item.license_id || "Unknown";

        const cleanedLicenseString = licenseSpdx
            .replace(/[()]/g, "")
            .replace(/\s+WITH\s+[^\s]+/gi, "");

        const licenseOptions = cleanedLicenseString
            .split(/\s+(?:OR|AND)\s+/i)
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0);

        let selectedLicenseId = "";
        const hasApache = licenseOptions.find((id: string) =>
            id.toLowerCase().includes("apache"),
        );
        const hasMit = licenseOptions.find((id: string) =>
            id.toLowerCase().includes("mit"),
        );

        if (hasApache) {
            selectedLicenseId = hasApache;
        } else if (hasMit) {
            selectedLicenseId = hasMit;
        } else if (licenseOptions.length > 0) {
            selectedLicenseId = licenseOptions[0];
        } else {
            selectedLicenseId = licenseSpdx;
        }

        formatted.push({
            id: `${crateName}@${crateVersion}`,
            name: selectedLicenseId,
            version: crateVersion,
            author: Array.isArray(item.authors) ? item.authors.join(", ") : "",
            repository: item.repository || "",
            license_text: item.text || "No license text provided.",
            source: "cargo",
        });
    }

    saveLicensesToDb(formatted, "cargo");
    console.log(
        `✅ Successfully synced ${formatted.length} cargo package licenses to the DB!`,
    );
} catch (err) {
    console.error("❌ Backend license sync failed.");
    console.error(err);
    process.exit(1);
}
