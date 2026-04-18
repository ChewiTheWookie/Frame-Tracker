import { createDataStore } from "@/stores/createDataStore";
import { taskService } from "@/api/tasks";
import { type TaskCategory } from "@/types/categories";
import { type TaskFilterState } from "@/types/filters";
import { type Task, type TaskStats } from "@/types/tasks";
import { shouldHide } from "@/utils/shouldHideObject";
import {
    calculateTaskToggleFavorite,
    calculateTaskStatAdjustment,
} from "@/utils/taskLogic";
import { error } from "@tauri-apps/plugin-log";
import { StoreApi, UseBoundStore } from "zustand";

interface TaskExtraActions {
    toggleFavorite: (id: string) => Promise<void>;
    setTask: (id: string, count: number) => Promise<void>;
    fetchData: () => Promise<void>;
}

const taskBundle = createDataStore<
    Task,
    TaskFilterState,
    TaskStats,
    TaskCategory
>({
    initialStats: { current: 0, total: 0 },
    initialFilters: {
        type: "tasks",
        favoriteFirst: true,
        hideIncomplete: false,
        hideComplete: false,
        hideFavorite: false,
        hideNonFavorite: false,
    },
    fetchItems: async ({ category, query, filters, limit, offset }) => {
        const [tasksArray, stats] = await Promise.all([
            taskService.getTasks(category, query, filters, limit, offset),
            taskService.getTaskStats(category),
        ]);
        return [tasksArray, stats];
    },
});

type FullTaskState = ReturnType<typeof taskBundle.useStore.getState> & {
    actions: TaskExtraActions;
};

export const useTaskStore = taskBundle.useStore as unknown as UseBoundStore<
    StoreApi<FullTaskState>
>;

useTaskStore.setState((state) => ({
    actions: {
        ...state.actions,

        toggleFavorite: async (id: string) => {
            const { items, itemIds, filters, activeCategory, stats } =
                useTaskStore.getState();
            const task = items[id];
            if (!task) return;

            const previousState = {
                items: { ...items },
                itemIds: [...itemIds],
                stats,
            };

            const newFavoriteStatus = task.favorite === 1 ? 0 : 1;
            const { updatedTask, newTaskIds } = calculateTaskToggleFavorite(
                items,
                itemIds,
                id,
                newFavoriteStatus,
                filters.favoriteFirst,
            );

            const finalIds = shouldHide(updatedTask, filters)
                ? newTaskIds.filter((tid) => tid !== id)
                : newTaskIds;

            useTaskStore.setState({
                items: { ...items, [id]: updatedTask },
                itemIds: finalIds,
            });

            try {
                await taskService.setFavorite(id, newFavoriteStatus === 1);
                const updatedStats =
                    await taskService.getTaskStats(activeCategory);
                useTaskStore.setState({ stats: updatedStats });
            } catch (err) {
                error(`Rollback favorite: ${err}`);
                useTaskStore.setState(previousState);
            }
        },

        setTask: async (id: string, count: number) => {
            const { items, itemIds, filters, activeCategory, stats } =
                useTaskStore.getState();
            const task = items[id];
            if (!task) return;

            const previousState = {
                items: { ...items },
                itemIds: [...itemIds],
                stats,
            };

            const newTotalCurrent = calculateTaskStatAdjustment(
                task,
                count,
                stats.current,
            );

            const updatedTask = { ...task, current_completions: count };
            const needsRemoval = shouldHide(updatedTask, filters);

            useTaskStore.setState((state) => ({
                items: { ...state.items, [id]: updatedTask },
                itemIds: needsRemoval
                    ? state.itemIds.filter((tid) => tid !== id)
                    : state.itemIds,
                stats: { ...state.stats, current: newTotalCurrent },
            }));

            try {
                const serverTask = await taskService.setTask(id, count);
                const updatedStats =
                    await taskService.getTaskStats(activeCategory);

                useTaskStore.setState((state) => ({
                    stats: updatedStats,
                    items: { ...state.items, [id]: serverTask },
                }));
            } catch (err) {
                error(`Rollback task update: ${err}`);
                useTaskStore.setState(previousState);
            }
        },
    },
}));

export const useTaskActions = () => useTaskStore((s) => s.actions);
export const useTaskIds = taskBundle.useItemIds;
export const useTaskById = taskBundle.useItemById;
export const useTaskStats = taskBundle.useStats;

useTaskStore.getState().actions.fetchData();
