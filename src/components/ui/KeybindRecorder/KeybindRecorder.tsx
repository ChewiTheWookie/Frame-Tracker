import { useState, useEffect } from "react";
import { KeyConfig } from "@/types/keybinds";
import { useKeybindStore } from "@/stores/useKeybindStore";
import styles from "./KeybindRecorder.module.css";

interface Props {
    action: string;
    label: string;
}

export function KeybindRecorder({ action, label }: Props) {
    const [isRecording, setIsRecording] = useState(false);

    const definition = useKeybindStore((s) => s.registry[action]);
    const updateKeybind = useKeybindStore((s) => s.updateKeybind);

    if (!definition) return null;
    const { config } = definition;

    useEffect(() => {
        if (!isRecording) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return;

            const newConfig: KeyConfig = {
                key: e.key.toLowerCase(),
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                isGlobal: config.isGlobal,
            };

            updateKeybind(action, newConfig);
            setIsRecording(false);
        };

        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return () =>
            window.removeEventListener("keydown", handleKeyDown, {
                capture: true,
            });
    }, [isRecording, action, config.isGlobal, updateKeybind]);

    const displayKey = (conf: KeyConfig) => {
        const parts = [];
        if (conf.ctrl) parts.push("Ctrl");
        if (conf.shift) parts.push("Shift");
        if (conf.alt) parts.push("Alt");
        parts.push(conf.key === " " ? "Space" : conf.key.toUpperCase());
        return parts.join(" + ");
    };

    return (
        <div className={styles.row}>
            <span className={styles.label}>{label}</span>
            <button
                type="button"
                className={`${styles.globalButton} ${config.isGlobal ? styles.active : ""}`}
                onClick={() =>
                    updateKeybind(action, {
                        ...config,
                        isGlobal: !config.isGlobal,
                    })
                }
                title={
                    config.isGlobal
                        ? "Global Shortcut (Works anywhere)"
                        : "Local Shortcut (App only)"
                }
            >
                Global
            </button>
            <button
                className={`${styles.recordButton} ${isRecording ? styles.recording : ""}`}
                onClick={() => setIsRecording(true)}
            >
                {isRecording ? "Press any key..." : displayKey(config)}
            </button>
        </div>
    );
}
