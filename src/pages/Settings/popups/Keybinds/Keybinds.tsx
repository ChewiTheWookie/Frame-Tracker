import { KeybindRecorder } from "@/components/ui/KeybindRecorder";
import {
    KEYBIND_METADATA,
    KeybindAction,
    KeybindGroup,
} from "@/types/keybinds";

import styles from "./Keybinds.module.css";

export function Keybinds() {
    const groupedBinds = Object.entries(KEYBIND_METADATA).reduce(
        (acc, [action, meta]) => {
            if (!acc[meta.group]) acc[meta.group] = [];
            acc[meta.group].push({
                action: action as KeybindAction,
                label: meta.label,
            });
            return acc;
        },
        {} as Record<KeybindGroup, { action: KeybindAction; label: string }[]>,
    );

    return (
        <>
            {Object.entries(groupedBinds).map(([group, binds]) => (
                <section key={group} className={styles.section}>
                    <h3 className={styles.title}>{group}</h3>
                    {binds.map((bind) => (
                        <KeybindRecorder
                            key={bind.action}
                            action={bind.action}
                            label={bind.label}
                        />
                    ))}
                </section>
            ))}
        </>
    );
}
