import { execSync } from "child_process";

async function runPrebuild() {
    try {
        console.log("🛠️  Starting modular prebuild...");

        console.log("\n1️⃣  Syncing Versions...");
        execSync("npx tsx scripts/sync-versions.ts", { stdio: "inherit" });

        console.log("\n2️⃣  Generating Frontend Licenses...");
        execSync("npx tsx scripts/licenses-frontend.ts", { stdio: "inherit" });

        console.log("\n3️⃣  Generating Backend Licenses...");
        execSync("npx tsx scripts/licenses-backend.ts", { stdio: "inherit" });

        console.log("\n✅ All prebuild tasks finished successfully!");
    } catch (error) {
        console.error("\n❌ Prebuild failed during a sub-script execution.");
        process.exit(1);
    }
}

runPrebuild();
