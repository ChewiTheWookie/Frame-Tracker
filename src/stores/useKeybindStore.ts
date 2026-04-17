import { create } from "zustand";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { KeyConfig, KeybindRegistry, KeybindAction } from "@/types/keybinds";
import { loadKeybindsApi, saveKeybindApi } from "@/api/keybinds";

interface KeybindState {
    registry: KeybindRegistry;
    initialize: () => Promise<void>;
    updateKeybind: (id: string, config: KeyConfig) => Promise<void>;
    refreshGlobalShortcuts: (
        callbackMap: Partial<Record<KeybindAction, () => void>>,
    ) => Promise<void>;
    isRecording: boolean;
    setIsRecording: (val: boolean) => void;
}

export const useKeybindStore = create<KeybindState>()((set, get) => ({
    registry: [] as KeybindRegistry,
    isRecording: false,
    setIsRecording: (val) => set({ isRecording: val }),

    initialize: async () => {
        try {
            const registry = await loadKeybindsApi();
            set({ registry });
        } catch (err) {
            console.error("Failed to initialize keybinds:", err);
        }
    },

    updateKeybind: async (id, newConfig) => {
        const { registry } = get();

        const updatedRegistry = registry.map((item) =>
            item.id === id ? { ...item, config: newConfig } : item,
        );
        set({ registry: updatedRegistry });

        try {
            await saveKeybindApi(id, newConfig);
        } catch (err) {
            console.error("Failed to save keybind update:", err);
        }
    },

    refreshGlobalShortcuts: async (callbackMap) => {
        try {
            await unregisterAll();
            const { registry } = get();

            for (const definition of registry) {
                const { id, config } = definition;

                if (config.isGlobal) {
                    const shortcut = formatShortcut(config);
                    const callback = callbackMap[id as KeybindAction];

                    if (callback) {
                        await register(shortcut, (event) => {
                            if (event.state === "Pressed") callback();
                        });
                    }
                }
            }
        } catch (err) {
            console.error("Global shortcut registration failed:", err);
        }
    },
}));

export function formatShortcut(config: KeyConfig): string {
    return [
        config.ctrl && "Control",
        config.shift && "Shift",
        config.alt && "Alt",
        config.key.toUpperCase(),
    ]
        .filter(Boolean)
        .join("+");
}
