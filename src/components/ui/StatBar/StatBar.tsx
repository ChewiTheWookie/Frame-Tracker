import { useLocation } from "react-router-dom";
import styles from "./StatBar.module.css";
import { useActiveStore } from "@/hooks/useActiveStore";
import { ROUTE_METADATA } from "@/routes/metadata";

export const StatBar = () => {
    const { pathname } = useLocation();
    const useStore = useActiveStore();
    const metadata = ROUTE_METADATA[pathname];

    const stats = useStore((s) => s.stats);

    if (!metadata?.hasStatBar || !stats) return null;

    const { current, total, helminthCurrent, helminthTotal } = stats;

    return (
        <div className={styles.statContainer}>
            <div className={styles.item}>
                <span className={styles.label}>{metadata.statLabel}</span>
                <span className={styles.value}>
                    <span>{current}</span>
                    <span>/{total}</span>
                </span>
            </div>

            {helminthTotal !== undefined && helminthTotal > 0 && (
                <>
                    <div className={styles.divider} />
                    <div className={styles.item}>
                        <span className={styles.label}>
                            {metadata.hStatLabel}
                        </span>
                        <span className={styles.value}>
                            <span>{helminthCurrent}</span>
                            <span>/{helminthTotal}</span>
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};
