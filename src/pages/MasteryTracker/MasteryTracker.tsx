import { useEffect, useMemo, useRef } from "react";
import { useActiveStore } from "../../hooks/useActiveStore";
import { Item } from "../../types/inventory";
import { InventoryCard } from "../../components/InventoryCard";
import { Grid } from "../../components/Grid";
import { Throbber } from "../../components/Throbber";
import { ScrollToTop } from "../../components/ScrollToTop";

import styles from "./MasteryTracker.module.css";

export function MasteryTracker() {
    const { store, rawInv } = useActiveStore();
    const { data: items, loading } = store;
    const { visibleCount, loadMore, fetchWikiData } = rawInv;

    const loaderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (items.length === 0) fetchWikiData();
    }, [fetchWikiData, items.length]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && items.length > visibleCount) {
                    loadMore();
                }
            },
            { threshold: 0, rootMargin: "0px 0px 400px 0px" },
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [items.length, visibleCount, loadMore]);

    const displayedItems = useMemo(() => {
        return (items as Item[]).slice(0, visibleCount);
    }, [items, visibleCount]);

    return (
        <div className={styles.trackerContainer}>
            {loading && items.length === 0 ? (
                <Throbber />
            ) : (
                <>
                    <Grid>
                        {displayedItems.map((item) => (
                            <InventoryCard key={item.id} item={item} />
                        ))}
                    </Grid>
                    {items.length > visibleCount && (
                        <div ref={loaderRef} className={styles.infiniteLoader}>
                            <div className={styles.loaderLine} />
                            <span>SCANNING REMAINING INVENTORY</span>
                            <div className={styles.loaderLine} />
                        </div>
                    )}
                </>
            )}
            <ScrollToTop />
        </div>
    );
}
