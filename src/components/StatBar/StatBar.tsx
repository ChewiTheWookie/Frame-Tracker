import { useMemo } from "react";
import { useActiveStore } from "../../hooks/useActiveStore";
import { Item } from "../../types/inventory";
import { WeeklyTask } from "../../types/weekly";
import styles from "./StatBar.module.css";

export function StatBar() {
    const { store, isWeekly, meta, rawInv, rawWeekly } = useActiveStore();

    const stats = useMemo(() => {
        const activeCat = store.activeCategory;

        if (isWeekly) {
            const allTasks = rawWeekly.tasks as WeeklyTask[];
            const filtered =
                activeCat === "All"
                    ? allTasks
                    : allTasks.filter((t) => t.category === activeCat);

            return {
                label: "COMPLETED",
                current: filtered.filter(
                    (t) => t.currentCompletions >= t.maxCompletions,
                ).length,
                total: filtered.length,
                showSecondary: false,
                secondaryLabel: "",
                secondaryCurrent: 0,
                secondaryTotal: 0,
            };
        }

        const allItems = rawInv.allItems as Item[];
        const filtered =
            activeCat === "All"
                ? allItems
                : allItems.filter((i) => i.category === activeCat);

        const feedableItems = filtered.filter((i) => i.isFeedable);

        return {
            label: "MASTERED",
            current: filtered.filter((i) => i.mastered).length,
            total: filtered.length,
            secondaryLabel: "FED",
            secondaryCurrent: filtered.filter((i) => i.helminthed).length,
            secondaryTotal: feedableItems.length,
            showSecondary: feedableItems.length > 0,
        };
    }, [isWeekly, store.activeCategory, rawInv.allItems, rawWeekly.tasks]);

    if (!meta?.features?.stats || !stats) {
        return null;
    }

    return (
        <div className={styles.statsBar}>
            <div className={styles.statItem}>
                <span className={styles.statLabel}>{stats.label}</span>
                <span className={styles.statValue}>
                    {stats.current}
                    <span>/{stats.total}</span>
                </span>
            </div>

            {stats.showSecondary && (
                <>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>
                            {stats.secondaryLabel}
                        </span>
                        <span className={styles.statValue}>
                            {stats.secondaryCurrent}
                            <span>/{stats.secondaryTotal}</span>
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
