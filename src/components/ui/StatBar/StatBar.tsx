import { useLocation } from "react-router-dom";
import { useActiveStore } from "@/hooks/useActiveStore";
import { ROUTE_METADATA } from "@/routes/metadata";
import { useState } from "react";
import { Dropdown } from "../Dropdown";
import { getStatFilterDefinitions } from "@/types/filters";

import styles from "./StatBar.module.css";

export const StatBar = () => {
    const { pathname } = useLocation();
    const useStore = useActiveStore();

    const sbFilters = useStore((s) => s.statBarFilters);
    const { setStatBarFilters } = useStore((s) => s.actions);
    const stats = useStore((s) => s.stats);

    const metadata = ROUTE_METADATA[pathname];
    const [isOpen, setIsOpen] = useState(false);

    if (!metadata?.hasStatBar || !stats || !sbFilters) return null;

    const { current, total, helminthCurrent, helminthTotal } = stats;

    const filterDefs = getStatFilterDefinitions(sbFilters, setStatBarFilters);

    return (
        <div className={styles.statContainer} onClick={() => setIsOpen(!isOpen)}>
            <div className={styles.item}>
                <span className={styles.label}>{metadata.statLabel}</span>
                <span className={styles.value}>
                    <span>{current}</span>
                    <span className={styles.total}>/{total}</span>
                </span>
            </div>

            {helminthTotal !== undefined && helminthTotal > 0 && (
                <>
                    <div className={styles.divider} />
                    <div className={styles.item}>
                        <span className={styles.label}>{metadata.hStatLabel}</span>
                        <span className={styles.value}>
                            <span>{helminthCurrent}</span>
                            <span className={styles.total}>/{helminthTotal}</span>
                        </span>
                    </div>
                </>

            )}

            <Dropdown
                isOpen={isOpen}
                items={
                    <>
                        {filterDefs.map((def) => (
                            <button
                                key={def.id}
                                onClick={() => def.onChange(!def.checked)}
                                className={def.checked ? "active" : ""}>
                                {def.label}
                            </button>
                        ))}
                    </>
                }
            />
        </div >
    );
};