import { invoke } from "@tauri-apps/api/core";
import { Task, TaskStats } from "@/types/tasks";
import { TaskCategory } from "@/types/categories";
import { TaskFilterState } from "@/types/filters";

export const taskService = {
    getTasks: (
        category: TaskCategory,
        search: string,
        filters: TaskFilterState,
        limit: number,
        offset: number,
    ): Promise<Task[]> =>
        invoke<Task[]>("get_tasks", {
            category,
            search,
            filters,
            limit,
            offset,
        }),

    getTaskStats: (
        category: TaskCategory,
        filters: TaskFilterState,
    ): Promise<TaskStats> =>
        invoke<TaskStats>("get_task_stats", { category, filters }),

    setFavorite: (id: string, isFavorite: boolean): Promise<void> =>
        invoke("set_favorite", { id, isFavorite }),

    setTask: (id: string, count: number): Promise<Task> =>
        invoke<Task>("set_task", { id, count }),
};
