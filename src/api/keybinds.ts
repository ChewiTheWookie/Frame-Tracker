import { invoke } from "@tauri-apps/api/core";
import { KeybindDefinition } from "@/types/keybinds";

export type KeybindRegistry = Record<string, KeybindDefinition>;

export async function loadKeybindsApi(): Promise<KeybindRegistry> {
    return await invoke<KeybindRegistry>("get_keybinds");
}

export async function saveKeybindsApi(mapping: KeybindRegistry): Promise<void> {
    await invoke("set_keybind", { mapping });
}
