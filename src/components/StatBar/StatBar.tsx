import { useInventoryStore } from "../../store/useInventoryStore";

import styles from "./StatBar.module.css";

export function StatBar() {
    const items = useInventoryStore((state) => state.items);
    const activeCategory = useInventoryStore((state) => state.activeCategory);

    const filteredItems =
        activeCategory === "All"
            ? items
            : items.filter((item) => item.category === activeCategory);

    const stats = {
        mastered: filteredItems.filter((i) => i.mastered).length,
        totalMastery: filteredItems.length,

        fed: filteredItems.filter((i) => i.helminthed).length,
        totalFed: filteredItems.filter((i) => i.isFeedable).length,
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
