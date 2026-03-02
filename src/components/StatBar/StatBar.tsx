import { useMemo } from "react";
import { useInventoryStore } from "../../store/useInventoryStore";

import styles from "./StatBar.module.css";

export function StatBar() {
    const allItems = useInventoryStore((state) => state.allItems);
    const activeCategory = useInventoryStore((state) => state.activeCategory);

    const categoryItems = useMemo(() => {
        return activeCategory === "All"
            ? allItems
            : allItems.filter((item) => item.category === activeCategory);
    }, [allItems, activeCategory]);

    const stats = {
        mastered: categoryItems.filter((i) => i.mastered).length,
        totalMastery: categoryItems.length,
        fed: categoryItems.filter((i) => i.helminthed).length,
        totalFed: categoryItems.filter((i) => i.isFeedable).length,
    };

    const showFedStats = stats.totalFed > 0;

    return (
        <div className={styles.statsBar}>
            <div className={styles.statItem}>
                <span className={styles.statLabel}>MASTERED</span>
                <span className={styles.statValue}>
                    {stats.mastered}
                    <span>/{stats.totalMastery}</span>
                </span>
            </div>

            {showFedStats && (
                <>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>FED</span>
                        <span className={styles.statValue}>
                            {stats.fed}
                            <span>/{stats.totalFed}</span>
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
