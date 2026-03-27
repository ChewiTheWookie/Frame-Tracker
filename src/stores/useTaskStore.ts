import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { TaskCategory } from "../types/categories";
import { TaskFilterState } from "../types/filters";
import { Task } from "../types/tasks";
import { shouldHide } from "../utils/shouldHideObject";
import {
    calculateTaskToggleFavorite,
    calculateTaskStatAdjustment,
} from "../utils/taskLogic";

interface TaskStats {
    current: number;
    total: number;
}

interface TaskState {
    tasks: Task[];
    stats: TaskStats;
    isLoading: boolean;
    error: string | null;

    page: number;
    hasMore: boolean;
    loadMore: () => void;

    activeCategory: TaskCategory;
    setCategory: (category: TaskCategory) => void;

    searchQuery: string;
    setSearch: (query: string) => void;

    filters: TaskFilterState;
    setFilters: (filters: TaskFilterState) => void;

    fetchTasks: (silent?: boolean) => Promise<void>;
    setTask: (id: string, count: number) => Promise<void>;
    toggleFavorite: (id: string) => Promise<void>;
}

const TOTAL_VISIBLE = 50;
let fetchVersion = 0;

const getDefaultResultState = () => ({
    tasks: [],
    page: 0,
    hasMore: true,
});

export const useTaskStore = create<TaskState>((set, get) => ({
    ...getDefaultResultState(),
    activeCategory: "All" as TaskCategory,
    stats: { current: 0, total: 0 },
    searchQuery: "",
    filters: {
        type: "tasks" as const,
        favoriteFirst: true,
        hideIncomplete: false,
        hideComplete: false,
        hideFavorite: false,
        hideNonFavorite: false,
    },
    isLoading: false,
    error: null,

    setCategory: (category) => {
        if (get().activeCategory === category) return;
        set({
            ...getDefaultResultState(),
            activeCategory: category,
            searchQuery: "",
            isLoading: true,
        });
        get().fetchTasks();
    },

    setSearch: (query) => {
        set({ ...getDefaultResultState(), searchQuery: query });
        get().fetchTasks(true);
    },

    setFilters: (newFilters) => {
        set({ ...getDefaultResultState(), filters: newFilters });
        get().fetchTasks(true);
    },

    loadMore: () => {
        const { isLoading, hasMore, page } = get();
        if (isLoading || !hasMore) return;
        set({ page: page + 1 });
        get().fetchTasks(true);
    },

    fetchTasks: async (silent = false) => {
        fetchVersion++;
        const currentVersion = fetchVersion;

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
                    filters,
                    limit: TOTAL_VISIBLE,
                    offset: page * TOTAL_VISIBLE,
                }),
                invoke<TaskStats>("get_task_stats", {
                    category: activeCategory,
                }),
            ]);

            if (currentVersion !== fetchVersion) return;

            set({
                tasks: page === 0 ? newTasks : [...existingTasks, ...newTasks],
                stats,
                isLoading: false,
                hasMore: newTasks.length === TOTAL_VISIBLE,
            });
        } catch (err) {
            if (currentVersion === fetchVersion) {
                set({ error: err as string, isLoading: false });
            }
        }
    },

    toggleFavorite: async (id: string) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const previousState = { tasks: get().tasks, stats: get().stats };
        const newFavoriteStatus = task.favorite === 1 ? 0 : 1;

        const updatedTasks = calculateTaskToggleFavorite(
            get().tasks,
            id,
            newFavoriteStatus,
            get().filters.favoriteFirst,
        );

        const finalTask = updatedTasks.find((t) => t.id === id);
        const filteredTasks =
            finalTask && shouldHide(finalTask, get().filters)
                ? updatedTasks.filter((t) => t.id !== id)
                : updatedTasks;

        set({ tasks: filteredTasks });

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
            console.error("Rollback favorite adjustment:", err);
            set(previousState);
        }
    },

    setTask: async (id: string, count: number) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const previousState = { tasks: get().tasks, stats: get().stats };

        const newCurrentCount = calculateTaskStatAdjustment(
            task,
            count,
            get().stats.current,
        );
        const updatedTasks = get().tasks.map((t) =>
            t.id === id ? { ...t, current_completions: count } : t,
        );

        const finalTask = updatedTasks.find((t) => t.id === id);
        const filteredTasks =
            finalTask && shouldHide(finalTask, get().filters)
                ? updatedTasks.filter((t) => t.id !== id)
                : updatedTasks;

        set({
            tasks: filteredTasks,
            stats: { ...get().stats, current: newCurrentCount },
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
            console.error("Rollback task completion adjustment:", err);
            set(previousState);
        }
    },
}));
