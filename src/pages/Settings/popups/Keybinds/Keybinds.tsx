import { KeybindRecorder } from "@/components/modules/KeybindRecorder";
import { useKeybindStore } from "@/stores/useKeybindStore";
import { ListSection } from "@/components/ui/ListSection";

export function Keybinds() {
    const registry = useKeybindStore((s) => s.registry);

    const groupedBinds = registry.reduce(
        (acc, definition) => {
            const { group, id, label } = definition;
            if (!acc[group]) acc[group] = [];
            acc[group].push({ id, label });
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
        <>
            {sortedGroups.map(([group, binds]) => (
                <ListSection key={group} title={group} list={
                    <>
                        {binds.map((bind) => (
                            <KeybindRecorder
                                key={bind.id}
                                action={bind.id}
                                label={bind.label}
                            />
                        ))}
                    </>
                } />
            ))}
        </>
    );
}
