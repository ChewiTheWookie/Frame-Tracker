import { useState, useEffect } from "react";
import { KeyConfig, KeybindAction } from "@/types/keybinds";
import { useKeybindStore } from "@/stores/useKeybindStore";
import styles from "./KeybindRecorder.module.css";

interface Props {
    action: KeybindAction;
    label: string;
}

export function KeybindRecorder({ action, label }: Props) {
    const [isRecording, setIsRecording] = useState(false);
    const config = useKeybindStore((s) => s.mapping[action]);
    const setKeybind = useKeybindStore((s) => s.setKeybind);

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

            setKeybind(action, newConfig);
            setIsRecording(false);
        };

        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return () =>
            window.removeEventListener("keydown", handleKeyDown, {
                capture: true,
            });
    }, [isRecording, action, config.isGlobal, setKeybind]);

    const displayKey = (config: KeyConfig) => {
        const parts = [];
        if (config.ctrl) parts.push("Ctrl");
        if (config.shift) parts.push("Shift");
        if (config.alt) parts.push("Alt");
        parts.push(config.key === " " ? "Space" : config.key.toUpperCase());
        return parts.join(" + ");
    };

    return (
        <div className={styles.row}>
            <span className={styles.label}>{label}</span>
            <button
                type="button"
                className={`${styles.globalButton} ${config.isGlobal ? styles.active : ""}`}
                onClick={() =>
                    setKeybind(action, {
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
