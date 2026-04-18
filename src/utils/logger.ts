import { error } from "@tauri-apps/plugin-log";

export const logFailure = (context: string) => (err: any) => {
    error(`${context}: ${err?.message || err}`);
};
