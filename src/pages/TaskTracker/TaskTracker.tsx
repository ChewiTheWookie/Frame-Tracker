import { useRef, useState } from "react";
import { CardGrid } from "@/components/modules/CardGrid";
import { TaskCard } from "@/components/modules/TaskCard";
import { ScrollSentinel } from "@/components/shared/ScrollSentinel";
import { Throbber } from "@/components/ui/Throbber";
import {
    useTaskActions,
    useTaskIds,
    useTaskStore,
} from "@/stores/useTaskStore";
import { Modal } from "@/components/ui/Modal";
import { TaskResetModal } from "@/components/modules/TaskResetModal";

export function TaskTracker() {
    const [isDismissed, setIsDismissed] = useState(false);

    const taskIds = useTaskIds();
    const { loadMore } = useTaskActions();

    const isLoading = useTaskStore((s) => s.isLoading);
    const hasMore = useTaskStore((s) => s.hasMore);
    const error = useTaskStore((s) => s.error);

    const showErrorModal = error !== null && !isDismissed;

    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <Modal
                isOpen={showErrorModal}
                onClose={() => setIsDismissed(true)}
                title="Error"
            >
                <p>Error loading tasks: {error}</p>
            </Modal>
            <TaskResetModal />
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
