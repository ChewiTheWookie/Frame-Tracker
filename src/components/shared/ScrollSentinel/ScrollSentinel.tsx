import { useEffect, useRef } from "react";
import { InfoContainer } from "@/components/ui/InfoContainer";

import styles from "./ScrollSentinel.module.css";

interface Props {
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    rootRef: React.RefObject<HTMLElement | null>;
}

export const ScrollSentinel = ({
    isLoading,
    hasMore,
    loadMore,
    rootRef,
}: Props) => {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            {
                root: root,
                threshold: 0,
                rootMargin: "0px 0px 1000px 0px",
            },
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isLoading, loadMore, rootRef.current]);

    if (!hasMore) return <InfoContainer message="No more items to show." />;

    return <div ref={sentinelRef} className={styles.sentinel} />;
};
