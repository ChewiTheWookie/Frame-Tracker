import { useEffect, useMemo } from "react";
import { useWeeklyStore } from "../../store/useWeeklyStore";
import { WeeklyCard } from "../../components/WeeklyCard/WeeklyCard";
import { Grid } from "../../components/Grid";
import { Throbber } from "../../components/Throbber";

import styles from "./WeeklyTracker.module.css";

export function WeeklyTracker() {
    const { tasks, isLoading, fetchTasks, activeCategory } = useWeeklyStore();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = useMemo(() => {
        if (activeCategory === "All") return tasks;
        return tasks.filter((task) => task.category === activeCategory);
    }, [tasks, activeCategory]);

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
                    <p>No tasks found for category: {activeCategory}</p>
                </div>
            )}
        </div>
    );
}
