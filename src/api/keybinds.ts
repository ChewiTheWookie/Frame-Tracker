import { invoke } from "@tauri-apps/api/core";
import { KeybindRegistry, KeyConfig } from "@/types/keybinds";

export async function loadKeybindsApi(): Promise<KeybindRegistry> {
    return await invoke<KeybindRegistry>("get_keybinds");
}

export async function saveKeybindApi(
    id: string,
    config: KeyConfig,
): Promise<void> {
    await invoke("set_keybind", { id, config });
}
