import { useEffect, useCallback } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { formatShortcut, useKeybindStore } from "@/stores/useKeybindStore";
import { KeybindAction } from "@/types/keybinds";

export const useActionKeybind = (
    action: KeybindAction | string,
    callback: () => void,
) => {
    const definition = useKeybindStore((s) => s.registry[action]);
    const isGlobalRecording = useKeybindStore((s) => s.isRecording);
    const config = definition?.config;

    const handleLocalKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!config || config.isGlobal || isGlobalRecording) return;

            const target = event.target as HTMLElement;
            const isInput =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;

            const isSpecialKey =
                config.key.toLowerCase() === "escape" || config.key === "/";
            const hasModifier = event.ctrlKey || event.altKey || event.metaKey;

            if (isInput && !hasModifier && !isSpecialKey) return;

            const keyMatch =
                event.key.toLowerCase() === config.key.toLowerCase();
            const modifierMatch =
                event.ctrlKey === config.ctrl &&
                event.shiftKey === config.shift &&
                event.altKey === config.alt;

            if (keyMatch && modifierMatch) {
                event.preventDefault();
                event.stopImmediatePropagation();
                callback();
            }
        },
        [config, callback, isGlobalRecording],
    );

    useEffect(() => {
        if (!config) return;

        if (config.isGlobal) {
            const shortcut = formatShortcut(config);

            register(shortcut, (event) => {
                const currentlyRecording =
                    useKeybindStore.getState().isRecording;
                if (currentlyRecording) return;

                if (event.state === "Pressed") {
                    callback();
                }
            }).catch(console.error);

            return () => {
                unregister(shortcut).catch(console.error);
            };
        } else {
            window.addEventListener("keydown", handleLocalKeyDown, {
                capture: true,
            });
            return () =>
                window.removeEventListener("keydown", handleLocalKeyDown, {
                    capture: true,
                });
        }
    }, [config, callback, handleLocalKeyDown]);
};
