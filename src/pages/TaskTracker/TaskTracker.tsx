import { useRef } from "react";
import { CardGrid } from "@/components/modules/CardGrid";
import { TaskCard } from "@/components/modules/TaskCard";
import { ScrollSentinel } from "@/components/shared/ScrollSentinel";
import { InfoContainer } from "@/components/ui/InfoContainer";
import { Throbber } from "@/components/ui/Throbber";
import {
    useTaskActions,
    useTaskIds,
    useTaskStore,
} from "@/stores/useTaskStore";

export function TaskTracker() {
    const taskIds = useTaskIds();
    const { loadMore } = useTaskActions();

    const isLoading = useTaskStore((s) => s.isLoading);
    const hasMore = useTaskStore((s) => s.hasMore);
    const error = useTaskStore((s) => s.error);

    const scrollRef = useRef<HTMLDivElement>(null);

    if (error)
        return <InfoContainer message={`Error loading tasks: ${error}`} />;

    return (
        <>
            {isLoading && taskIds.length === 0 ? (
                <Throbber label={"Loading Tasks"} />
            ) : (
                <CardGrid ref={scrollRef}>
                    {taskIds.map((id) => (
                        <TaskCard key={id} taskId={id} />
                    ))}
                    <ScrollSentinel
                        isLoading={isLoading}
                        hasMore={hasMore}
                        loadMore={loadMore}
                        targetRef={scrollRef}
                    />
                </CardGrid>
            )}
        </>
    );
}
