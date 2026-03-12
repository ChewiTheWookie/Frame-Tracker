import { useEffect, useMemo, useRef } from "react";
import { useInventoryStore } from "../../store/useInventoryStore";
import { InventoryCard } from "../../components/InventoryCard";
import { Grid } from "../../components/Grid";
import { Throbber } from "../../components/Throbber";
import { ScrollToTop } from "../../components/ScrollToTop";

import styles from "./MasteryTracker.module.css";

export function MasteryTracker() {
    // Optimized selection: only pull what is necessary for this view
    const items = useInventoryStore((state) => state.items);
    const loading = useInventoryStore((state) => state.loading);
    const visibleCount = useInventoryStore((state) => state.visibleCount);
    const loadMore = useInventoryStore((state) => state.loadMore);
    const fetchWikiData = useInventoryStore((state) => state.fetchWikiData);

    const loaderRef = useRef<HTMLDivElement>(null);

    // Initial data fetch
    useEffect(() => {
        if (items.length === 0) {
            fetchWikiData();
        }
    }, [fetchWikiData, items.length]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && items.length > visibleCount) {
                    loadMore();
                }
            },
            {
                threshold: 0,
                rootMargin: "0px 0px 400px 0px",
            },
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [items.length, visibleCount, loadMore]);

    // Slice items for display based on visibleCount
    const displayedItems = useMemo(() => {
        return items.slice(0, visibleCount);
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

            {/* Component handles its own visibility and logic */}
            <ScrollToTop />
        </div>
    );
}
