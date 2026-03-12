import fs from "node:fs";

const PKG_PATH = "./package.json";
const CARGO_PATH = "./src-tauri/Cargo.toml";

try {
    const pkg = JSON.parse(fs.readFileSync(PKG_PATH, "utf8"));
    const version = pkg.version;

    let cargoContent = fs.readFileSync(CARGO_PATH, "utf8");

    const newContent = cargoContent.replace(
        /^version = ".*"/m,
        `version = "${version}"`,
    );

    fs.writeFileSync(CARGO_PATH, newContent);
    console.log(`✅ Cargo.toml synced to v${version}`);
} catch (err) {
    console.error("❌ Version sync failed");
    process.exit(1);
}
