import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";

export async function checkForUpdates() {
    const update = await check();

    if (update?.available) {
        const yes = await ask(
            `An update to version ${update.version} is available. Would you like to install it now?`,
            { title: "Update Available", kind: "info" },
        );

        if (yes) {
            await update.downloadAndInstall();
            await relaunch();
        }
    }
}
