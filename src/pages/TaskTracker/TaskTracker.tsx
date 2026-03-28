import { useEffect, useRef } from "react";
import {
    useTaskStore,
    useTaskIds,
    useTaskStats,
} from "../../stores/useTaskStore";
import { TASK_CATEGORIES, TaskCategory } from "../../types/categories";
import { CardGrid } from "../../components/CardGrid";
import { CategoryTabs } from "../../components/CategoryTabs";
import { Throbber } from "../../components/Throbber";
import { TaskCard } from "../../components/TaskCard";
import { Searchbar } from "../../components/Searchbar";
import { StatBar } from "../../components/StatBar";
import { InfoContainer } from "../../components/InfoContainer";
import { ScrollSentinel } from "../../components/ScrollSentinel";
import { ScrollToTop } from "../../components/ScrollToTop";

import styles from "./TaskTracker.module.css";

export function TaskTracker() {
    const taskIds = useTaskIds();
    const stats = useTaskStats();

    const fetchTasks = useTaskStore((s) => s.fetchTasks);
    const isLoading = useTaskStore((s) => s.isLoading);
    const loadMore = useTaskStore((s) => s.loadMore);
    const hasMore = useTaskStore((s) => s.hasMore);
    const error = useTaskStore((s) => s.error);
    const activeCategory = useTaskStore((s) => s.activeCategory);
    const setCategory = useTaskStore((s) => s.setCategory);
    const search = useTaskStore((s) => s.searchQuery);
    const setSearch = useTaskStore((s) => s.setSearch);
    const filters = useTaskStore((s) => s.filters);
    const setFilters = useTaskStore((s) => s.setFilters);

    const scrollRef = useRef<HTMLElement>(null);

    useEffect(() => {
        fetchTasks();
    }, [activeCategory, filters]);

    if (error)
        return <InfoContainer message={`Error loading tasks: ${error}`} />;

    return (
        <main ref={scrollRef} className={styles.main}>
            <header className={styles.navContainer}>
                <CategoryTabs<TaskCategory>
                    categories={TASK_CATEGORIES}
                    activeCategory={activeCategory as TaskCategory}
                    onCategoryChange={setCategory}
                />
                <nav className={styles.navBottom}>
                    <Searchbar
                        search={search}
                        setSearch={setSearch}
                        activeCategory={activeCategory}
                        filters={filters}
                        setFilters={setFilters}
                    />
                    <StatBar
                        label="Completed"
                        current={stats.current}
                        total={stats.total}
                    />
                </nav>
            </header>

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
        </main>
    );
}
