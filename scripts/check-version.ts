import { execSync } from "child_process";
import * as fs from "fs";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

async function checkVersion() {
    const rl = readline.createInterface({ input, output });

    try {
        console.log("🔍 Comapring version to Github releases...");
        const packageJson = JSON.parse(
            fs.readFileSync("./package.json", "utf-8"),
        );
        const localVersion = `v${packageJson.version}`;

        console.log("\x1b[36m%s\x1b[0m", "🔍 Checking GitHub tags...");

        const latestTag = execSync("git describe --tags --abbrev=0")
            .toString()
            .trim();

        if (localVersion === latestTag) {
            console.warn(
                "\x1b[33m%s\x1b[0m",
                `⚠️  WARNING: Local version (${localVersion}) matches the latest GitHub tag.`,
            );

            const answer = await rl.question(
                "   Continue with build anyway? (y/N): ",
            );

            if (answer.toLowerCase() !== "y") {
                console.log(
                    "\x1b[31m%s\x1b[0m",
                    "❌ Build aborted. Please increment version in package.json",
                );
                process.exit(1);
            }
        } else {
            console.log(
                "\x1b[32m%s\x1b[0m",
                `✅ Version bump detected: ${latestTag} -> ${localVersion}`,
            );
        }
    } catch (error) {
        console.log(
            "\x1b[34m%s\x1b[0m",
            "ℹ️  No remote tags found. Proceeding with initial build.",
        );
    } finally {
        rl.close();
    }
}

checkVersion();
