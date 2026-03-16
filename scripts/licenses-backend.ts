import { execSync } from "child_process";
import { saveLicensesToDb } from "./utils/db";

try {
    console.log("🦀 Gathering Rust licenses...");

    const rawOutput = execSync("cargo about generate about.hbs", {
        cwd: "./src-tauri",
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 10,
    });
    const data = JSON.parse(rawOutput);

    const formatted = data.map((pkg: any) => ({
        id: `${pkg.name}@${pkg.version}`,
        name: pkg.license_id || "Unknown",
        version: pkg.version,
        author: "",
        repository: pkg.repository || "",
        license_text: pkg.text || "",
    }));

    saveLicensesToDb(formatted, "cargo");

    console.log("✅ Backend licenses successfully synced to database.");
} catch (err) {
    console.error("❌ Backend license sync failed.");
    console.error(err);
    process.exit(1);
}
