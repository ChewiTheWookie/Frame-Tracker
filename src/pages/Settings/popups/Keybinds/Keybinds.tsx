import { useRef } from "react";
import { KeybindRecorder } from "@/components/ui/KeybindRecorder";
import { useKeybindStore } from "@/stores/useKeybindStore";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

import styles from "./Keybinds.module.css";

export function Keybinds() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const registry = useKeybindStore((s) => s.registry);

    const groupedBinds = Object.entries(registry).reduce(
        (acc, [id, definition]) => {
            const { group } = definition;
            if (!acc[group]) acc[group] = [];
            acc[group].push({ id, label: definition.label });
            return acc;
        },
        {} as Record<string, { id: string; label: string }[]>,
    );

    const sortedGroups = Object.entries(groupedBinds).sort(
        ([groupA], [groupB]) => {
            if (groupA === "Search & Filters") return -1;
            if (groupB === "Search & Filters") return 1;
            return groupA.localeCompare(groupB);
        },
    );

    return (
        <div className={styles.scrollContainer} ref={scrollRef}>
            {sortedGroups.map(([group, binds]) => (
                <section key={group} className={styles.section}>
                    <h3 className={styles.title}>{group}</h3>
                    <div className={styles.grid}>
                        {binds.map((bind) => (
                            <KeybindRecorder
                                key={bind.id}
                                action={bind.id}
                                label={bind.label}
                            />
                        ))}
                    </div>
                </section>
            ))}
            <ScrollToTop targetRef={scrollRef} />
        </div>
    );
}
