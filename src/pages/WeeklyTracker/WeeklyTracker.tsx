import { useEffect } from "react";
import { useActiveStore } from "../../hooks/useActiveStore";
import { WeeklyTask } from "../../types/weekly";
import { WeeklyCard } from "../../components/WeeklyCard/WeeklyCard";
import { Grid } from "../../components/Grid";
import { Throbber } from "../../components/Throbber";
import { ScrollToTop } from "../../components/ScrollToTop";

import styles from "./WeeklyTracker.module.css";

export function WeeklyTracker() {
    const { store, rawWeekly } = useActiveStore();
    const { data, loading, search, filters, activeCategory } = store;
    const tasks = data as WeeklyTask[];

    useEffect(() => {
        rawWeekly.fetchTasks();
    }, [search, activeCategory, filters]);

    if (loading && tasks.length === 0) return <Throbber />;

    return (
        <div className={styles.trackerContainer}>
            {tasks.length > 0 ? (
                <Grid>
                    {tasks.map((task) => (
                        <WeeklyCard key={task.id} task={task} />
                    ))}
                </Grid>
            ) : (
                <div className={styles.noResults}>No tasks found.</div>
            )}
            <ScrollToTop />
        </div>
    );
}
