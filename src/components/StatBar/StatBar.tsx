import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useInventoryStore } from "../../store/useInventoryStore";
import { useWeeklyStore } from "../../store/useWeeklyStore";
import { ROUTE_REGISTRY } from "../../routes/metadata";

import styles from "./StatBar.module.css";

export function StatBar() {
    const location = useLocation();
    const meta = ROUTE_REGISTRY[location.pathname];

    const allItems = useInventoryStore((state) => state.allItems);
    const activeMasteryCat = useInventoryStore((state) => state.activeCategory);

    const weeklyTasks = useWeeklyStore((state) => state.tasks);
    const activeWeeklyCat = useWeeklyStore((state) => state.activeCategory);

    const stats = useMemo(() => {
        if (meta?.storeType === "weekly") {
            const filtered =
                activeWeeklyCat === "All"
                    ? weeklyTasks
                    : weeklyTasks.filter((t) => t.category === activeWeeklyCat);

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

        const filtered =
            activeMasteryCat === "All"
                ? allItems
                : allItems.filter((item) => item.category === activeMasteryCat);

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
    }, [
        meta?.storeType,
        allItems,
        activeMasteryCat,
        weeklyTasks,
        activeWeeklyCat,
    ]);

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
