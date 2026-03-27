import { Task } from "../types/tasks";

export const calculateTaskToggleFavorite = (
    tasks: Task[],
    id: string,
    newFavoriteStatus: number,
    favoriteFirst: boolean,
): Task[] => {
    let updatedTasks = tasks.map((t) =>
        t.id === id ? { ...t, favorite: newFavoriteStatus } : t,
    );

    if (!favoriteFirst) return updatedTasks;

    if (newFavoriteStatus === 1) {
        const target = updatedTasks.find((t) => t.id === id);
        if (target) {
            updatedTasks = [target, ...updatedTasks.filter((t) => t.id !== id)];
        }
    } else {
        updatedTasks.sort((a, b) => {
            if (b.favorite !== a.favorite) return b.favorite - a.favorite;
            return a.name.localeCompare(b.name);
        });
    }

    return updatedTasks;
};

export const calculateTaskStatAdjustment = (
    task: Task,
    newCount: number,
    currentStatCount: number,
): number => {
    const wasComplete = task.current_completions === task.max_completions;
    const isComplete = newCount === task.max_completions;

    let adjustedCount = currentStatCount;
    if (!wasComplete && isComplete) adjustedCount++;
    if (wasComplete && !isComplete) adjustedCount--;

    return adjustedCount;
};
