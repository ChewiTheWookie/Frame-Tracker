import { execSync } from "child_process";
import { saveLicensesToDb } from "./utils/db";

try {
    console.log("🦀 Gathering Rust licenses...");

    const rawOutput = execSync("cargo about generate --format json", {
        cwd: "./src-tauri",
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 50,
    });

    const data = JSON.parse(rawOutput);
    const formatted: any[] = [];

    if (data && typeof data === "object" && data.overview && data.crates) {
        for (const pkg of data.crates) {
            const pkgLicenseId =
                pkg.package.license || pkg.license || "Unknown";

            const cleanedLicenseString = pkgLicenseId
                .replace(/[()]/g, "")
                .replace(/\s+WITH\s+[^\s]+/gi, "");

            const licenseOptions = cleanedLicenseString
                .split(/\s+(?:OR|AND)\s+/i)
                .map((id: string) => id.trim())
                .filter((id: string) => id.length > 0);

            let selectedLicenseId = "";
            let licenseDetail: any = null;

            const hasApache = licenseOptions.find((id: string) =>
                id.toLowerCase().includes("apache"),
            );
            if (hasApache) {
                selectedLicenseId = hasApache;
                licenseDetail = data.overview.find(
                    (l: any) => l.id === hasApache,
                );
            }

            if (!licenseDetail) {
                const hasMit = licenseOptions.find((id: string) =>
                    id.toLowerCase().includes("mit"),
                );
                if (hasMit) {
                    selectedLicenseId = hasMit;
                    licenseDetail = data.overview.find(
                        (l: any) => l.id === hasMit,
                    );
                }
            }

            if (!licenseDetail && licenseOptions.length > 0) {
                selectedLicenseId = licenseOptions[0];
                licenseDetail = data.overview.find(
                    (l: any) => l.id === selectedLicenseId,
                );
            }

            formatted.push({
                id: `${pkg.package.name}@${pkg.package.version}`,
                name: pkgLicenseId,
                version: pkg.package.version,
                author: pkg.package.authors?.join(", ") || "",
                repository: pkg.package.repository || "",
                license_text:
                    licenseDetail?.text || "No license text provided.",
            });
        }
    } else if (Array.isArray(data)) {
        for (const licenseGroup of data) {
            const licenseText = licenseGroup.text || "";
            const licenseName = licenseGroup.name || "Unknown";

            if (Array.isArray(licenseGroup.used_by)) {
                for (const pkg of licenseGroup.used_by) {
                    formatted.push({
                        id: `${pkg.name}@${pkg.version}`,
                        name: licenseName,
                        version: pkg.version,
                        author: "",
                        repository: pkg.repository || "",
                        license_text: licenseText,
                    });
                }
            }
        }
    } else {
        throw new Error("Unexpected JSON structure from cargo about.");
    }

    saveLicensesToDb(formatted, "cargo");
} catch (err) {
    console.error("❌ Backend license sync failed.");
    console.error(err);
    process.exit(1);
}
