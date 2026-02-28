import { useEffect } from "react";
import { useDailyStore } from "../../store/useDailyStore";
import { DailysCard } from "../../components/DailysCard/DailysCard";
import { Grid } from "../../components/Grid";
import { DailyTask } from "../../types/dailyTask";

export function DailysTracker() {
    const { worldState, isLoading, refreshState } = useDailyStore();

    // Fetch the live data from Rust on mount
    useEffect(() => {
        refreshState();
    }, [refreshState]);

    if (isLoading)
        return (
            <div style={{ padding: "2rem", color: "white" }}>
                Syncing with Lotus...
            </div>
        );
    if (!worldState) return null;

    // Helper to transform API data into your DailyTask format
    const sortieTasks: DailyTask[] = worldState.sortie.variants.map((v, i) => ({
        id: `sortie-${i}`,
        name: v.missionType, // TS now knows missionType exists!
        category: "Sortie",
        description: `${v.node} — ${v.modifier}`,
        completed: false,
    }));

    const cetusTask: DailyTask = {
        id: "cetus-cycle",
        name: worldState.cetusCycle.isDay ? "Cetus: Day" : "Cetus: Night",
        category: "Farming",
        description: `Time remaining: ${worldState.cetusCycle.timeLeft}`,
        completed: false,
    };

    console.log("Current WorldState:", worldState); //TODO REMOVE WHEN DONE

    return (
        <>
            <p style={{ color: "#666", fontSize: "0.8rem", padding: "1rem" }}>
                World State ETA: {worldState.sortie.eta}
            </p>
            <Grid>
                {/* Render the Open World Cycle */}
                <DailysCard
                    task={cetusTask}
                    onToggle={(id) => console.log(id)}
                />

                {/* Render all 3 Sortie Missions */}
                {sortieTasks.map((task) => (
                    <DailysCard
                        key={task.id}
                        task={task}
                        onToggle={(id) => console.log(id)}
                    />
                ))}
            </Grid>
        </>
    );
}
