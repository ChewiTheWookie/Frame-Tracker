import { Task } from "@/types/tasks";

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
