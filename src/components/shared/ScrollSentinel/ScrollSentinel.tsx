import { useEffect, useRef } from "react";

import styles from "./ScrollSentinel.module.css";

interface Props {
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    targetRef: React.RefObject<HTMLElement | null>;
}

export const ScrollSentinel = ({
    isLoading,
    hasMore,
    loadMore,
    targetRef: rootRef,
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

    return <div ref={sentinelRef} className={styles.sentinel} />;
};
