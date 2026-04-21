import { execSync } from "child_process";

export async function gatherBackendLicenses() {
    console.log("\n🦀 Generating Rust licenses...");
    const rawOutput = execSync("cargo about generate about.hbs", {
        cwd: "./src-tauri",
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 50,
    });

    const data = JSON.parse(rawOutput);
    return data.map((item: any) => ({
        id: `${item.name}@${item.version}`,
        name: item.license_id || "Unknown",
        version: item.version,
        author: Array.isArray(item.authors) ? item.authors.join(", ") : "",
        repository: item.repository || "",
        license_text: item.text || "",
        source: "cargo",
    }));
}
