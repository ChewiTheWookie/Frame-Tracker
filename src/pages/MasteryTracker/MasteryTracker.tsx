import { useRef } from "react";
import {
    useMasteryStore,
    useMasteryItemIds,
    useMasteryActions,
} from "@/stores/useMasteryStore";
import { CardGrid } from "@/components/modules/CardGrid";
import { MasteryCard } from "@/components/modules/MasteryCard";
import { Throbber } from "@/components/ui/Throbber";
import { ScrollSentinel } from "@/components/shared/ScrollSentinel";
import { InfoContainer } from "@/components/ui/InfoContainer";

export function MasteryTracker() {
    const itemIds = useMasteryItemIds();
    const { loadMore } = useMasteryActions();

    const isLoading = useMasteryStore((s) => s.isLoading);
    const hasMore = useMasteryStore((s) => s.hasMore);
    const error = useMasteryStore((s) => s.error);

    const scrollRef = useRef<HTMLDivElement>(null);

    if (error)
        return <InfoContainer message={`Error loading Items: ${error}`} />;

    return (
        <>
            {isLoading && itemIds.length === 0 ? (
                <Throbber label="Loading Items" />
            ) : (
                <>
                    <CardGrid ref={scrollRef}>
                        {itemIds.map((id) => (
                            <MasteryCard key={id} itemId={id} />
                        ))}
                        <ScrollSentinel
                            isLoading={isLoading}
                            hasMore={hasMore}
                            loadMore={loadMore}
                            targetRef={scrollRef}
                        />
                    </CardGrid>
                </>
            )}
        </>
    );
}
