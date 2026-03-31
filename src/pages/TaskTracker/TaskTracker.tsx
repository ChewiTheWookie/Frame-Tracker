import { useRef } from "react";
import { useTaskStore, useTaskIds } from "@/stores/useTaskStore";
import { CardGrid } from "@/components/modules/CardGrid";
import { Throbber } from "@/components/ui/Throbber";
import { TaskCard } from "@/components/modules/TaskCard";
import { InfoContainer } from "@/components/ui/InfoContainer";
import { ScrollSentinel } from "@/components/shared/ScrollSentinel";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

export function TaskTracker() {
    const taskIds = useTaskIds();

    const isLoading = useTaskStore((s) => s.isLoading);
    const loadMore = useTaskStore((s) => s.loadMore);
    const hasMore = useTaskStore((s) => s.hasMore);
    const error = useTaskStore((s) => s.error);

    const scrollRef = useRef<HTMLElement>(null);

    if (error)
        return <InfoContainer message={`Error loading tasks: ${error}`} />;

    return (
        <>
            {isLoading && taskIds.length === 0 ? (
                <Throbber label={"Loading Tasks"} />
            ) : (
                <>
                    <CardGrid>
                        {taskIds.map((id) => (
                            <TaskCard key={id} taskId={id} />
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
