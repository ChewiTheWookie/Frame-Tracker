import { ARCHIMEDEA_IDS, MAX_PULSES, PULSE_COST, Task } from "@/types/tasks";

export const calculateTaskToggleFavorite = (
    taskMap: Record<string, Task>,
    taskIds: string[],
    id: string,
    newFavoriteStatus: number,
    favoriteFirst: boolean,
): { updatedTask: Task; newTaskIds: string[] } => {
    const updatedTask = { ...taskMap[id], favorite: newFavoriteStatus };

    if (!favoriteFirst) {
        return { updatedTask, newTaskIds: taskIds };
    }

    const allTasks = taskIds.map((tid) =>
        tid === id ? updatedTask : taskMap[tid],
    );

    const sortedIds = allTasks
        .sort((a, b) => {
            if (b.favorite !== a.favorite) return b.favorite - a.favorite;
            return a.name.localeCompare(b.name);
        })
        .map((t) => t.id);

    return { updatedTask, newTaskIds: sortedIds };
};

export const calculateTaskStatAdjustment = (
    task: Task,
    newCount: number,
    currentStatCount: number,
): number => {
    const wasComplete = task.current_completions === task.max_completions;
    const isNowComplete = newCount === task.max_completions;

    let adjustedCount = currentStatCount;

    if (!wasComplete && isNowComplete) adjustedCount++;
    if (wasComplete && !isNowComplete) adjustedCount--;

    return adjustedCount;
};

export const calculatePulseUpdates = (
    taskMap: Record<string, Task>,
    targetId: string,
    newCount: number,
    currentGlobalStats: number,
) => {
    const updates: Record<string, number> = { [targetId]: newCount };
    const netracellTask = taskMap["netracells"];
    let adjustedStats = currentGlobalStats;

    adjustedStats = calculateTaskStatAdjustment(
        taskMap[targetId],
        newCount,
        adjustedStats,
    );

    if (ARCHIMEDEA_IDS.includes(targetId)) {
        const isCompleting = newCount > taskMap[targetId].current_completions;
        const isUnchecking = newCount < taskMap[targetId].current_completions;

        if (isCompleting) {
            const alreadyPaid = ARCHIMEDEA_IDS.some(
                (id) => taskMap[id].current_completions > 0,
            );

            if (!alreadyPaid) {
                const nextNetracellCount = Math.min(
                    MAX_PULSES,
                    netracellTask.current_completions + PULSE_COST,
                );
                updates["netracells"] = nextNetracellCount;
                adjustedStats = calculateTaskStatAdjustment(
                    netracellTask,
                    nextNetracellCount,
                    adjustedStats,
                );
            }

            if (
                targetId === "elite_deep_archimedea" &&
                taskMap["deep_archimedea"].current_completions > 0
            ) {
                updates["deep_archimedea"] = 0;
                adjustedStats = calculateTaskStatAdjustment(
                    taskMap["deep_archimedea"],
                    0,
                    adjustedStats,
                );
            }
        } else if (isUnchecking) {
            const remainingArchimedea = ARCHIMEDEA_IDS.filter(
                (id) => id !== targetId,
            ).some((id) => taskMap[id].current_completions > 0);

            if (!remainingArchimedea) {
                const nextNetracellCount = Math.max(
                    0,
                    netracellTask.current_completions - PULSE_COST,
                );
                updates["netracells"] = nextNetracellCount;
                adjustedStats = calculateTaskStatAdjustment(
                    netracellTask,
                    nextNetracellCount,
                    adjustedStats,
                );
            }
        }
    }

    return { updates, adjustedStats };
};
