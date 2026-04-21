import { createDataStore } from "@/stores/createDataStore";
import { taskService } from "@/api/tasks";
import { type TaskCategory } from "@/types/categories";
import { type TaskFilterState } from "@/types/filters";
import { ARCHIMEDEA_IDS, type Task, type TaskStats } from "@/types/tasks";
import { shouldHide } from "@/utils/shouldHideObject";
import {
    calculateTaskToggleFavorite,
    calculateTaskStatAdjustment,
    calculatePulseUpdates,
} from "@/utils/taskLogic";
import { error } from "@tauri-apps/plugin-log";
import { StoreApi, UseBoundStore } from "zustand";

interface TaskExtraActions {
    toggleFavorite: (id: string) => Promise<void>;
    setTask: (id: string, count: number) => Promise<void>;
    fetchData: () => Promise<void>;
    setResetModal: (isOpen: boolean, taskNames?: string[]) => void;
}

//TODO Remove when stats are implemented
const INITIAL_FILTERS: TaskFilterState = {
    type: "tasks",
    favoriteFirst: true,
    hideIncomplete: false,
    hideComplete: false,
    hideFavorite: false,
    hideNonFavorite: false,
};

const taskBundle = createDataStore<
    Task,
    TaskFilterState,
    TaskStats,
    TaskCategory
>({
    initialStats: { current: 0, total: 0 },
    initialFilters: INITIAL_FILTERS,
    fetchItems: async ({ category, query, filters, limit, offset }) => {
        const [tasksArray, stats] = await Promise.all([
            taskService.getTasks(category, query, filters, limit, offset),
            taskService.getTaskStats(category, INITIAL_FILTERS),
        ]);
        return [tasksArray, stats];
    },
});

type FullTaskState = ReturnType<typeof taskBundle.useStore.getState> & {
    resetModal: { isOpen: boolean; taskNames: string[] };
    actions: TaskExtraActions;
};

export const useTaskStore = taskBundle.useStore as unknown as UseBoundStore<
    StoreApi<FullTaskState>
>;

useTaskStore.setState((state) => ({
    resetModal: { isOpen: false, taskNames: [] },

    actions: {
        ...state.actions,

        setResetModal: (isOpen: boolean, taskNames: string[] = []) => {
            useTaskStore.setState({ resetModal: { isOpen, taskNames } });
        },

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
                const updatedStats = await taskService.getTaskStats(
                    activeCategory,
                    INITIAL_FILTERS,
                );
                useTaskStore.setState({ stats: updatedStats });
            } catch (err) {
                error(`Rollback favorite: ${err}`);
                useTaskStore.setState(previousState);
            }
        },

        setTask: async (id: string, count: number) => {
            const { items, itemIds, filters, stats, activeCategory } =
                useTaskStore.getState();
            const task = items[id];
            const netracellTask = items["netracells"];

            if (!task || !netracellTask) return;

            const isCompleting = count > task.current_completions;
            const isUnchecking = count < task.current_completions;

            if (isCompleting && ARCHIMEDEA_IDS.includes(id)) {
                const available = 5 - netracellTask.current_completions;
                const alreadyPaid = ARCHIMEDEA_IDS.some(
                    (aid) => items[aid].current_completions > 0,
                );
                if (!alreadyPaid && available < 2) return;

                if (
                    id === "elite_temporal_archimedea" &&
                    (items["deep_archimedea"].current_completions > 0 ||
                        items["elite_deep_archimedea"].current_completions > 0)
                )
                    return;
                if (
                    (id === "deep_archimedea" ||
                        id === "elite_deep_archimedea") &&
                    items["elite_temporal_archimedea"].current_completions > 0
                )
                    return;
                if (
                    id === "deep_archimedea" &&
                    items["elite_deep_archimedea"].current_completions > 0
                ) {
                    return;
                }
            }

            if (id === "netracells" && isUnchecking) {
                const anyArchimedeaComplete = ARCHIMEDEA_IDS.some(
                    (aid) => items[aid].current_completions > 0,
                );
                if (anyArchimedeaComplete && count < 2) return;
            }

            let finalUpdates: Record<string, number> = { [id]: count };
            let finalAdjustedStats = stats.current;

            if (ARCHIMEDEA_IDS.includes(id) || id === "netracells") {
                const { updates, adjustedStats } = calculatePulseUpdates(
                    items,
                    id,
                    count,
                    stats.current,
                );
                finalUpdates = updates;
                finalAdjustedStats = adjustedStats;
            } else {
                finalAdjustedStats = calculateTaskStatAdjustment(
                    task,
                    count,
                    stats.current,
                );
            }

            const previousState = {
                items: { ...items },
                itemIds: [...itemIds],
                stats: { ...stats },
            };
            const newItems = { ...items };
            let newItemIds = [...itemIds];

            Object.entries(finalUpdates).forEach(([uid, ucount]) => {
                const updatedObj = {
                    ...newItems[uid],
                    current_completions: ucount,
                };
                newItems[uid] = updatedObj;

                if (shouldHide(updatedObj, filters)) {
                    newItemIds = newItemIds.filter((tid) => tid !== uid);
                } else if (!newItemIds.includes(uid)) {
                    newItemIds.push(uid);
                }
            });

            useTaskStore.setState({
                items: newItems,
                itemIds: newItemIds,
                stats: { ...stats, current: finalAdjustedStats },
            });

            try {
                for (const [uid, ucount] of Object.entries(finalUpdates)) {
                    await taskService.setTask(uid, ucount);
                }
                const freshStats = await taskService.getTaskStats(
                    activeCategory,
                    INITIAL_FILTERS,
                );
                useTaskStore.setState({ stats: freshStats });
            } catch (err) {
                error(`Task update failed: ${err}`);
                useTaskStore.setState(previousState);
            }
        },
    },
}));

export const useTaskActions = () => useTaskStore((s) => s.actions);
export const useTaskIds = taskBundle.useItemIds;
export const useTaskById = taskBundle.useItemById;
export const useTaskStats = taskBundle.useStats;

export const useResetModal = () => useTaskStore((s) => s.resetModal);

useTaskStore.getState().actions.fetchData();
