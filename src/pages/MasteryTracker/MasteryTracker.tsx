import { useRef } from "react";
import { useMasteryStore, useMasteryItemIds } from "@/stores/useMasteryStore";
import { CardGrid } from "@/components/modules/CardGrid";
import { MasteryCard } from "@/components/modules/MasteryCard";
import { Throbber } from "@/components/ui/Throbber";
import { ScrollSentinel } from "@/components/shared/ScrollSentinel";
import { InfoContainer } from "@/components/ui/InfoContainer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

export function MasteryTracker() {
    const itemIds = useMasteryItemIds();
    const isLoading = useMasteryStore((s) => s.isLoading);
    const loadMore = useMasteryStore((s) => s.loadMore);
    const hasMore = useMasteryStore((s) => s.hasMore);
    const error = useMasteryStore((s) => s.error);

    const scrollRef = useRef<HTMLElement>(null);

    if (error)
        return <InfoContainer message={`Error loading Items: ${error}`} />;

    return (
        <>
            {isLoading && itemIds.length === 0 ? (
                <Throbber label="Loading Items" />
            ) : (
                <>
                    <CardGrid>
                        {itemIds.map((id) => (
                            <MasteryCard key={id} itemId={id} />
                        ))}
                    </CardGrid>
                    <ScrollSentinel
                        isLoading={isLoading}
                        hasMore={hasMore}
                        loadMore={loadMore}
                        rootRef={scrollRef}
                    />
                </>
            )}
            <ScrollToTop />
        </>
    );
}
