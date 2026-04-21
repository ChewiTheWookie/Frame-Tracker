import { execSync } from "child_process";
import { gatherFrontendLicenses } from "./licenses-frontend";
import { gatherBackendLicenses } from "./licenses-backend";
import { saveToDb, generateLicenseTextFile } from "./utils/output-handlers.ts";
import { isBlacklisted } from "./utils/blacklist";

async function runPrebuild() {
    try {
        console.log("🛠️  Starting modular prebuild...");

        execSync("npx tsx scripts/check-version.ts", { stdio: "inherit" });
        execSync("npx tsx scripts/sync-versions.ts", { stdio: "inherit" });

        const frontendRaw = await gatherFrontendLicenses();
        const backendRaw = await gatherBackendLicenses();
        const allLicenses = [...frontendRaw, ...backendRaw];

        console.log("\n📄 Generating full THIRD_PARTY_LICENSES.txt...");
        generateLicenseTextFile(allLicenses);

        console.log("\n🗄️  Syncing filtered licenses to DB...");
        const filteredLicenses = allLicenses.filter(
            (pkg) => !isBlacklisted(pkg.id),
        );
        saveToDb(filteredLicenses);

        console.log("\n✅ Prebuild finished successfully!");
    } catch (error) {
        console.error("\n❌ Prebuild failed.", error);
        process.exit(1);
    }
}

runPrebuild();
