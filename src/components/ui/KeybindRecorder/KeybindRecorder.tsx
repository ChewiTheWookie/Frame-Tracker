import { useState, useEffect } from "react";
import { KeyConfig } from "@/types/keybinds";
import { useKeybindStore } from "@/stores/useKeybindStore";
import { ListItem } from "../ListItem";
import { CardButton } from "../CardButton";
import { CircleX, Earth } from "lucide-react";

import styles from "./KeybindRecorder.module.css";

interface Props {
    action: string;
    label: string;
}

export function KeybindRecorder({ action, label }: Props) {
    const [isRecording, setIsRecording] = useState(false);
    const setGlobalRecording = useKeybindStore((s) => s.setIsRecording);

    const definition = useKeybindStore((s) =>
        s.registry.find((item) => item.id === action),
    );
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
            setGlobalRecording(false);
        };

        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return () => {
            window.removeEventListener("keydown", handleKeyDown, {
                capture: true,
            });
        };
    }, [
        isRecording,
        action,
        config.isGlobal,
        updateKeybind,
        setGlobalRecording,
    ]);

    const displayKey = (conf: KeyConfig) => {
        if (!conf.key || conf.key === "") return "Unassigned";

        const parts = [];
        if (conf.ctrl) parts.push("Ctrl");
        if (conf.shift) parts.push("Shift");
        if (conf.alt) parts.push("Alt");

        const keyName = conf.key === " " ? "Space" : conf.key.toUpperCase();
        parts.push(keyName);

        return parts.join(" + ");
    };

    return (
        <ListItem
            title={label}
            fontSize="1rem"
            button={
                <CardButton
                    label={
                        isRecording ? "Press any key..." : displayKey(config)
                    }
                    onClick={() => {
                        setIsRecording(true);
                        setGlobalRecording(true);
                    }}
                    width="10rem"
                />
            }
            dropdown={
                <div className="ListItemDropdown">
                    <button
                        onClick={() =>
                            updateKeybind(action, {
                                ...config,
                                isGlobal: !config.isGlobal,
                            })
                        }
                        className={config.isGlobal ? styles.active : ""}
                    >
                        <Earth size={12} /> Global
                    </button>
                    <button
                        onClick={() =>
                            updateKeybind(action, {
                                key: "",
                                ctrl: false,
                                shift: false,
                                alt: false,
                                isGlobal: false,
                            })
                        }
                    >
                        <CircleX size={12} /> Clear bind
                    </button>
                </div>
            }
        />
    );
}
