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
        type: "tasks",
        hideIncomplete: false,
        hideComplete: false,
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

    setTask: async (id: string, count: number) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const wasComplete = task.current_completions === task.max_completions;
        const isComplete = count === task.max_completions;

        set((state) => {
            let newCurrent = state.stats.current;
            if (!wasComplete && isComplete) newCurrent++;
            if (wasComplete && !isComplete) newCurrent--;

            return {
                stats: { ...state.stats, current: newCurrent },
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, current_completions: count } : t,
                ),
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
