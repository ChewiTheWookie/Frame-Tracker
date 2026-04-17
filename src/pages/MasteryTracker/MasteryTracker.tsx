import { useRef, useState } from "react";
import {
    useMasteryStore,
    useMasteryItemIds,
    useMasteryActions,
} from "@/stores/useMasteryStore";
import { CardGrid } from "@/components/modules/CardGrid";
import { MasteryCard } from "@/components/modules/MasteryCard";
import { Throbber } from "@/components/ui/Throbber";
import { ScrollSentinel } from "@/components/shared/ScrollSentinel";
import { Modal } from "@/components/ui/Modal";

export function MasteryTracker() {
    const [isDismissed, setIsDismissed] = useState(false);

    const itemIds = useMasteryItemIds();
    const { loadMore } = useMasteryActions();

    const isLoading = useMasteryStore((s) => s.isLoading);
    const hasMore = useMasteryStore((s) => s.hasMore);
    const error = useMasteryStore((s) => s.error);

    const showErrorModal = error !== null && !isDismissed;

    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <Modal
                isOpen={showErrorModal}
                onClose={() => setIsDismissed(true)}
                title="Error"
            >
                <p>Error loading Items: {error}</p>
            </Modal>
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
