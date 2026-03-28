import { execSync } from "child_process";
import { saveLicensesToDb } from "./utils/db";

try {
    console.log("🦀 Gathering Rust licenses using raw JSON...");

    const rawOutput = execSync("cargo about generate --format json", {
        cwd: "./src-tauri",
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 50,
    });

    const data = JSON.parse(rawOutput);
    const formatted: any[] = [];

    const crates = data.crates || (Array.isArray(data) ? data : []);

    if (crates.length === 0) {
        throw new Error("No crates found in the cargo-about output structure.");
    }

    for (const item of crates) {
        const pkg = item.package || item;

        const crateName = pkg.name;
        const crateVersion = pkg.version;
        const licenseSpdx = pkg.license || item.license || "Unknown";

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

        let licenseText = "No license text provided.";
        if (data.overview && Array.isArray(data.overview)) {
            const overviewMatch = data.overview.find(
                (o: any) => o.id === selectedLicenseId,
            );
            if (overviewMatch?.text) {
                licenseText = overviewMatch.text;
            }
        }

        formatted.push({
            id: `${crateName}@${crateVersion}`,
            name: selectedLicenseId,
            version: crateVersion,
            author: pkg.authors?.join(", ") || "",
            repository: pkg.repository || "",
            license_text: licenseText,
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
