import { useRef } from "react";
import { KeybindRecorder } from "@/components/ui/KeybindRecorder";
import {
    KEYBIND_METADATA,
    KeybindAction,
    KeybindGroup,
} from "@/types/keybinds";

import styles from "./Keybinds.module.css";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

export function Keybinds() {
    const scrollRef = useRef<HTMLDivElement>(null);

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
        <div className={styles.scrollContainer} ref={scrollRef}>
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
            <ScrollToTop targetRef={scrollRef} />
        </div>
    );
}
