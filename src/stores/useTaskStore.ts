import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { TaskCategory } from "../types/categories";
import { TaskFilterState } from "../types/filters";
import { Task } from "../types/tasks";

interface TaskStats {
    current: number;
    total: number;
}

interface TaskState {
    tasks: Task[];
    activeCategory: TaskCategory;
    stats: TaskStats;
    searchQuery: string;
    filters: TaskFilterState;
    isLoading: boolean;
    page: number;
    hasMore: boolean;
    loadMore: () => void;
    error: string | null;

    setCategory: (category: TaskCategory) => void;
    setSearch: (query: string) => void;

    setFilters: (filters: TaskFilterState) => void;
    fetchTasks: (silent?: boolean) => Promise<void>;
    toggleFavorite: (id: string) => Promise<void>;
    setTask: (id: string, count: number) => Promise<void>;
}

const TOTAL_VISIBLE = 50;

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    page: 0,
    hasMore: true,
    activeCategory: "All" as TaskCategory,
    stats: { current: 0, total: 0 },
    searchQuery: "",
    filters: {
        type: "tasks" as const,
        hideIncomplete: false,
        hideComplete: false,
        favoriteFirst: true,
        hideFavorite: false,
        hideNonFavorite: false,
    },
    isLoading: false,
    error: null,

    setCategory: (category) => {
        if (get().activeCategory === category) return;
        set({
            activeCategory: category,
            searchQuery: "",
            page: 0,
            tasks: [],
            hasMore: true,
        });
        get().fetchTasks();
    },

    setSearch: (query) => {
        set({ searchQuery: query, page: 0, tasks: [], hasMore: true });
        get().fetchTasks(true);
    },

    setFilters: (newFilters: TaskFilterState) => {
        set({ filters: newFilters });
        get().fetchTasks(true);
    },

    loadMore: () => {
        const { isLoading, hasMore, page } = get();
        if (isLoading || !hasMore) return;
        set({ page: page + 1 });
        get().fetchTasks(true);
    },

    fetchTasks: async (silent = false) => {
        if (get().isLoading && silent) return;

        const {
            searchQuery,
            activeCategory,
            filters,
            page,
            tasks: existingTasks,
        } = get();

        if (!silent) set({ isLoading: true, error: null });
        else set({ isLoading: true });

        try {
            const [newTasks, stats] = await Promise.all([
                invoke<Task[]>("get_tasks", {
                    category: activeCategory,
                    search: searchQuery,
                    filters: filters,
                    limit: TOTAL_VISIBLE,
                    offset: page * TOTAL_VISIBLE,
                }),
                invoke<TaskStats>("get_task_stats", {
                    category: activeCategory,
                }),
            ]);

            const updatedTasks =
                page === 0 ? newTasks : [...existingTasks, ...newTasks];

            set({
                tasks: updatedTasks,
                stats,
                isLoading: false,
                hasMore: newTasks.length === TOTAL_VISIBLE,
            });
        } catch (err) {
            set({ error: err as string, isLoading: false });
        }
    },

    toggleFavorite: async (id: string) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return;

        const newFavoriteStatus = task.favorite === 1 ? 0 : 1;

        const { filters } = get();

        set((state) => {
            let newTasks = state.tasks.map((t) =>
                t.id === id ? { ...t, favorite: newFavoriteStatus } : t,
            );

            if (state.filters.favoriteFirst) {
                if (newFavoriteStatus === 1) {
                    const favoritedTask = newTasks.find((t) => t.id === id);
                    if (favoritedTask) {
                        newTasks = [
                            favoritedTask,
                            ...newTasks.filter((t) => t.id !== id),
                        ];
                    }
                } else {
                    newTasks.sort((a, b) => {
                        if (b.favorite !== a.favorite)
                            return b.favorite - a.favorite;
                        return a.name.localeCompare(b.name);
                    });
                }
            }

            const updatedTask = newTasks.find((t) => t.id === id);
            if (updatedTask && shouldHideTask(updatedTask, filters)) {
                newTasks = newTasks.filter((t) => t.id !== id);
            }

            return { tasks: newTasks };
        });

        try {
            await invoke("set_favorite", {
                id,
                isFavorite: newFavoriteStatus === 1,
            });

            const updatedStats = await invoke<TaskStats>("get_task_stats", {
                category: get().activeCategory,
            });
            set({ stats: updatedStats });
        } catch (err) {
            console.error("Failed to update favorite:", err);
            get().fetchTasks(true);
        }
    },

    setTask: async (id: string, count: number) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const wasComplete = task.current_completions === task.max_completions;
        const isComplete = count === task.max_completions;

        const { filters } = get();

        set((state) => {
            let newCurrent = state.stats.current;
            if (!wasComplete && isComplete) newCurrent++;
            if (wasComplete && !isComplete) newCurrent--;

            let nextTasks = state.tasks.map((t: Task) =>
                t.id === id ? { ...t, current_completions: count } : t,
            );

            const taskToVerify = nextTasks.find((t: Task) => t.id === id);
            if (taskToVerify && shouldHideTask(taskToVerify, filters)) {
                nextTasks = nextTasks.filter((t: Task) => t.id !== id);
            }

            return {
                stats: { ...state.stats, current: newCurrent },
                tasks: nextTasks,
            };
        });

        try {
            const updatedTask = await invoke<Task>("set_task", { id, count });

            const updatedStats = await invoke<TaskStats>("get_task_stats", {
                category: get().activeCategory,
            });

            set((state) => ({
                stats: updatedStats,
                tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
            }));
        } catch (err) {
            console.error(err);
            get().fetchTasks(true);
        }
    },
}));

listen("tasks-reset", () => {
    useTaskStore.getState().fetchTasks();
});

const shouldHideTask = (task: Task, filters: TaskFilterState): boolean => {
    const isComplete = task.current_completions === task.max_completions;
    const isFavorite = task.favorite === 1;

    if (filters.hideComplete && isComplete) return true;
    if (filters.hideIncomplete && !isComplete) return true;
    if (filters.hideFavorite && isFavorite) return true;
    if (filters.hideNonFavorite && !isFavorite) return true;

    return false;
};
