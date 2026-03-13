import { useMemo } from "react";
import { useActiveStore } from "../../hooks/useActiveStore";
import styles from "./StatBar.module.css";

export function StatBar() {
    const { store, isWeekly, meta } = useActiveStore();

    const stats = useMemo(() => {
        if (!store) return null;

        if (isWeekly && "tasks" in store) {
            const filtered =
                store.activeCategory === "All"
                    ? store.tasks
                    : store.tasks.filter(
                          (t) => t.category === store.activeCategory,
                      );

            return {
                label: "COMPLETED",
                current: filtered.filter(
                    (t) =>
                        (t.currentCompletions as number) >=
                        (t.maxCompletions as number),
                ).length,
                total: filtered.length,
                showSecondary: false,
                secondaryLabel: "",
                secondaryCurrent: 0,
                secondaryTotal: 0,
            };
        }

        if ("allItems" in store) {
            const filtered =
                store.activeCategory === "All"
                    ? store.allItems
                    : store.allItems.filter(
                          (item) => item.category === store.activeCategory,
                      );

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
        }

        return null;
    }, [store, isWeekly]);

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
