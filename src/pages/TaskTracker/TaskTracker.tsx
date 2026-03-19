import { useEffect, useRef } from "react";
import { useTaskStore } from "../../stores/useTaskStore";
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
    const tasks = useTaskStore((state) => state.tasks);
    const fetchTasks = useTaskStore((state) => state.fetchTasks);
    const isLoading = useTaskStore((state) => state.isLoading);
    const loadMore = useTaskStore((s) => s.loadMore);
    const hasMore = useTaskStore((s) => s.hasMore);
    const error = useTaskStore((state) => state.error);
    const activeCategory = useTaskStore((state) => state.activeCategory);
    const stats = useTaskStore((state) => state.stats);
    const setCategory = useTaskStore((state) => state.setCategory);
    const search = useTaskStore((state) => state.searchQuery);
    const setSearch = useTaskStore((state) => state.setSearch);
    const filters = useTaskStore((state) => state.filters);
    const setFilters = useTaskStore((state) => state.setFilters);
    const toggleFavorite = useTaskStore((state) => state.toggleFavorite);
    const setTask = useTaskStore((state) => state.setTask);

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
            {isLoading ? (
                <Throbber label={"Loading Tasks"} />
            ) : (
                <>
                    <CardGrid>
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                set_task={setTask}
                                toggleFavorite={toggleFavorite}
                            />
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
