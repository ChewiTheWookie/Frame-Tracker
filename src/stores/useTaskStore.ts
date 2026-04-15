import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { taskService } from "@/api/tasks";
import { TaskCategory } from "@/types/categories";
import { TaskFilterState } from "@/types/filters";
import { Task, TaskStats } from "@/types/tasks";
import { shouldHide } from "@/utils/shouldHideObject";
import {
    calculateTaskToggleFavorite,
    calculateTaskStatAdjustment,
} from "@/utils/taskLogic";

interface TaskState {
    tasks: Record<string, Task>;
    taskIds: string[];
    stats: TaskStats;
    isLoading: boolean;
    isFetchingMore: boolean;
    error: string | null;
    page: number;
    hasMore: boolean;
    activeCategory: TaskCategory;
    searchQuery: string;
    filters: TaskFilterState;

    actions: {
        setCategory: (category: TaskCategory) => void;
        setSearch: (query: string) => void;
        setFilters: (filters: TaskFilterState) => void;
        loadMore: () => Promise<void>;
        fetchTasks: (silent?: boolean) => Promise<void>;
        setTask: (id: string, count: number) => Promise<void>;
        toggleFavorite: (id: string) => Promise<void>;
    };
}

const TOTAL_VISIBLE = 50;
let fetchVersion = 0;

const getDefaultResultState = () => ({
    tasks: {} as Record<string, Task>,
    taskIds: [] as string[],
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
    isFetchingMore: false,
    error: null,

    actions: {
        setCategory: (category) => {
            if (get().activeCategory === category) return;
            set({
                ...getDefaultResultState(),
                activeCategory: category,
                isLoading: true,
            });
            get().actions.fetchTasks();
        },

        setSearch: (query) => {
            set({ ...getDefaultResultState(), searchQuery: query });
            get().actions.fetchTasks(true);
        },

        setFilters: (newFilters) => {
            set({ ...getDefaultResultState(), filters: newFilters });
            get().actions.fetchTasks(true);
        },

        loadMore: async () => {
            const { isLoading, isFetchingMore, hasMore, page, taskIds } = get();
            if (isLoading || isFetchingMore || !hasMore || taskIds.length === 0)
                return;

            set({ isFetchingMore: true, page: page + 1 });
            await get().actions.fetchTasks(true);
            set({ isFetchingMore: false });
        },

        fetchTasks: async (silent = false) => {
            fetchVersion++;
            const currentVersion = fetchVersion;
            const { searchQuery, activeCategory, filters, page } = get();

            if (!silent) set({ isLoading: true, error: null });

            try {
                const [newTasksArray, stats] = await Promise.all([
                    taskService.getTasks(
                        activeCategory,
                        searchQuery,
                        filters,
                        TOTAL_VISIBLE,
                        page * TOTAL_VISIBLE,
                    ),
                    taskService.getTaskStats(activeCategory),
                ]);

                if (currentVersion !== fetchVersion) return;

                set((state) => {
                    const newTasksMap = { ...state.tasks };
                    const newTaskIds = page === 0 ? [] : [...state.taskIds];

                    newTasksArray.forEach((task) => {
                        newTasksMap[task.id] = task;
                        if (!newTaskIds.includes(task.id)) {
                            newTaskIds.push(task.id);
                        }
                    });

                    return {
                        tasks: newTasksMap,
                        taskIds: newTaskIds,
                        stats,
                        isLoading: false,
                        hasMore: newTasksArray.length === TOTAL_VISIBLE,
                    };
                });
            } catch (err) {
                if (currentVersion === fetchVersion) {
                    set({ error: String(err), isLoading: false });
                }
            }
        },

        toggleFavorite: async (id: string) => {
            const task = get().tasks[id];
            if (!task) return;

            const previousState = {
                tasks: get().tasks,
                taskIds: get().taskIds,
                stats: get().stats,
            };

            const newFavoriteStatus = task.favorite === 1 ? 0 : 1;

            const { updatedTask, newTaskIds } = calculateTaskToggleFavorite(
                get().tasks,
                get().taskIds,
                id,
                newFavoriteStatus,
                get().filters.favoriteFirst,
            );

            const finalIds = shouldHide(updatedTask, get().filters)
                ? newTaskIds.filter((tid) => tid !== id)
                : newTaskIds;

            set({
                tasks: { ...get().tasks, [id]: updatedTask },
                taskIds: finalIds,
            });

            try {
                await taskService.setFavorite(id, newFavoriteStatus === 1);
                const updatedStats = await taskService.getTaskStats(
                    get().activeCategory,
                );
                set({ stats: updatedStats });
            } catch (err) {
                console.error("Rollback favorite:", err);
                set(previousState);
            }
        },

        setTask: async (id: string, count: number) => {
            const task = get().tasks[id];
            if (!task) return;

            const previousState = {
                tasks: get().tasks,
                taskIds: get().taskIds,
                stats: get().stats,
            };

            const newTotalCurrent = calculateTaskStatAdjustment(
                task,
                count,
                get().stats.current,
            );

            const updatedTask = { ...task, current_completions: count };
            const needsRemoval = shouldHide(updatedTask, get().filters);

            set((state) => ({
                tasks: { ...state.tasks, [id]: updatedTask },
                taskIds: needsRemoval
                    ? state.taskIds.filter((tid) => tid !== id)
                    : state.taskIds,
                stats: { ...state.stats, current: newTotalCurrent },
            }));

            try {
                const serverTask = await taskService.setTask(id, count);
                const updatedStats = await taskService.getTaskStats(
                    get().activeCategory,
                );

                set((state) => ({
                    stats: updatedStats,
                    tasks: { ...state.tasks, [id]: serverTask },
                }));
            } catch (err) {
                console.error("Rollback task update:", err);
                set(previousState);
            }
        },
    },
}));

export const useTaskActions = () => useTaskStore((s) => s.actions);
export const useTaskIds = () => useTaskStore(useShallow((s) => s.taskIds));
export const useTaskById = (id: string) => useTaskStore((s) => s.tasks[id]);
export const useTaskStats = () => useTaskStore(useShallow((s) => s.stats));

useTaskStore.getState().actions.fetchTasks();
