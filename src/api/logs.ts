import { invoke } from "@tauri-apps/api/core";
import { error } from "@tauri-apps/plugin-log";

/**
 * @returns {Promise<string>}
 */
export const fetchAppLogs = async (): Promise<string> => {
    try {
        return await invoke<string>("get_logs");
    } catch (err) {
        error(`Failed to fetch logs from backend: ${err}`);
        throw err;
    }
};
