import { create } from "zustand";
import { persist } from "zustand/middleware";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import {
    DEFAULT_BINDS,
    KeybindAction,
    KeyConfig,
    KeyMapping,
} from "@/types/keybinds";

interface KeybindState {
    mapping: KeyMapping;
    setKeybind: (action: KeybindAction, config: KeyConfig) => void;
    refreshGlobalShortcuts: (
        callbackMap: Record<string, () => void>,
    ) => Promise<void>;
}

export const useKeybindStore = create<KeybindState>()(
    persist(
        (set, get) => ({
            mapping: DEFAULT_BINDS,

            setKeybind: (action, config) => {
                set((state) => ({
                    mapping: { ...state.mapping, [action]: config },
                }));
            },

            refreshGlobalShortcuts: async (callbackMap) => {
                await unregisterAll();

                const { mapping } = get();

                for (const [action, config] of Object.entries(mapping)) {
                    if (config.isGlobal) {
                        const shortcut = formatShortcut(config);
                        const callback = callbackMap[action];

                        if (callback) {
                            await register(shortcut, (event) => {
                                if (event.state === "Pressed") callback();
                            });
                        }
                    }
                }
            },
        }),
        { name: "keybind-storage" },
    ),
);

function formatShortcut(config: KeyConfig) {
    return [
        config.ctrl && "Control",
        config.shift && "Shift",
        config.alt && "Alt",
        config.key.toUpperCase(),
    ]
        .filter(Boolean)
        .join("+");
}
