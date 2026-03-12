import { execSync } from "child_process";

try {
    console.log("🦀 Gathering Rust licenses...");

    execSync(
        "cargo about generate about.hbs > ../src/assets/cargo-licenses.json",
        {
            cwd: "./src-tauri",
            stdio: "inherit",
        },
    );

    console.log("✅ Generated: cargo-licenses.json");
} catch (err) {
    console.error("❌ Backend license sync failed.");
    process.exit(1);
}
