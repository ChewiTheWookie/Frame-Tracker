import { useEffect, useMemo } from "react";
import { useWeeklyStore } from "../../store/useWeeklyStore";
import { TAG_FILTER_MAP } from "../../types/weekly";
import { WeeklyCard } from "../../components/WeeklyCard/WeeklyCard";
import { Grid } from "../../components/Grid";
import { Throbber } from "../../components/Throbber";

import styles from "./WeeklyTracker.module.css";

export function WeeklyTracker() {
    const { tasks, isLoading, fetchTasks, activeCategory, search, filters } =
        useWeeklyStore();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            if (activeCategory !== "All" && task.category !== activeCategory)
                return false;

            const searchLower = search.toLowerCase();
            const matchesSearch =
                task.name.toLowerCase().includes(searchLower) ||
                (task.location?.toLowerCase().includes(searchLower) ?? false) ||
                (task.terminal?.toLowerCase().includes(searchLower) ?? false);

            if (!matchesSearch) return false;

            const isDone = task.currentCompletions >= task.maxCompletions;

            if (filters.hideCompleted && isDone) return false;
            if (filters.hideIncompleted && !isDone) return false;

            const isHiddenByTags = Object.entries(TAG_FILTER_MAP).some(
                ([filterKey, tagName]) => {
                    const isFilterActive =
                        filters[filterKey as keyof typeof filters];
                    return isFilterActive && task.tags?.includes(tagName);
                },
            );

            if (isHiddenByTags) return false;

            return true;
        });
    }, [tasks, activeCategory, search, filters]);

    if (isLoading && tasks.length === 0) {
        return <Throbber />;
    }

    return (
        <div className={styles.trackerContainer}>
            {filteredTasks.length > 0 ? (
                <Grid>
                    {filteredTasks.map((task) => (
                        <WeeklyCard key={task.id} task={task} />
                    ))}
                </Grid>
            ) : (
                <div className={styles.noResults}>
                    <p>No tasks match your current filters or search query.</p>
                </div>
            )}
        </div>
    );
}
