import { createDataStore } from "@/stores/createDataStore";
import { masteryService } from "@/api/mastery";
import { type MasteryCategory } from "@/types/categories";
import { type MasteryFilterState } from "@/types/filters";
import { MasteryStats, type Item } from "@/types/items";
import { shouldHide } from "@/utils/shouldHideObject";
import {
    calculateComponentQuantity,
    calculateMasteryToggle,
} from "@/utils/itemLogic";
import { error } from "@tauri-apps/plugin-log";
import { StoreApi, UseBoundStore } from "zustand";

interface MasteryExtraActions {
    updateComponentQuantity: (
        itemId: string,
        componentName: string,
        quantity: number,
    ) => Promise<void>;
    toggleMastery: (
        itemId: string,
        field: "mastered" | "owned" | "helminthed",
    ) => Promise<void>;
}

//TODO Remove when added the stats filtering
const INITIAL_FILTERS: MasteryFilterState = {
    type: "mastery",
    hideNonPrime: false,
    hidePrime: false,
    hideUnowned: false,
    hideCraftable: false,
    hideOwned: false,
    hideMastered: false,
    hideHelminthed: false,
};

const masteryBundle = createDataStore<
    Item,
    MasteryFilterState,
    MasteryStats,
    MasteryCategory
>({
    initialStats: {
        current: 0,
        total: 0,
        helminthCurrent: 0,
        helminthTotal: 0,
    },
    initialFilters: {
        type: "mastery",
        hideNonPrime: false,
        hidePrime: false,
        hideUnowned: false,
        hideCraftable: false,
        hideOwned: false,
        hideMastered: false,
        hideHelminthed: false,
    },
    fetchItems: async ({ category, query, filters, limit, offset }) => {
        const [itemsArray, stats] = await Promise.all([
            masteryService.getItems(category, query, filters, limit, offset),
            masteryService.getMasteryStats(category, INITIAL_FILTERS),
        ]);
        return [itemsArray, stats];
    },
});

type FullMasteryState = ReturnType<typeof masteryBundle.useStore.getState> & {
    actions: MasteryExtraActions;
};

export const useMasteryStore =
    masteryBundle.useStore as unknown as UseBoundStore<
        StoreApi<FullMasteryState>
    >;

useMasteryStore.setState((state) => ({
    actions: {
        ...state.actions,
        updateComponentQuantity: async (itemId, componentName, quantity) => {
            const { items, filters, itemIds } = useMasteryStore.getState();
            const item = items[itemId];
            if (!item) return;

            const previousState = {
                items: { ...items },
                itemIds: [...itemIds],
            };
            const updatedItem = calculateComponentQuantity(
                item,
                componentName,
                quantity,
            );
            const needsRemoval = shouldHide(updatedItem, filters);

            useMasteryStore.setState((state) => ({
                items: { ...state.items, [itemId]: updatedItem },
                itemIds: needsRemoval
                    ? state.itemIds.filter((id) => id !== itemId)
                    : state.itemIds,
            }));

            try {
                const component = updatedItem.components.find(
                    (c) => c.componentName === componentName,
                );
                await masteryService.setComponent(
                    itemId,
                    componentName,
                    component!.ownedQuantity,
                );
            } catch (err) {
                error(`Rollback: ${err}`);
                useMasteryStore.setState(previousState);
            }
        },
        toggleMastery: async (itemId, field) => {
            const { items, filters, activeCategory, stats, itemIds } =
                useMasteryStore.getState();
            const item = items[itemId];
            if (!item) return;

            const previousState = {
                items: { ...items },
                itemIds: [...itemIds],
                stats,
            };
            const updatedItem = calculateMasteryToggle(
                item,
                field,
                !item[field],
            );
            const needsRemoval = shouldHide(updatedItem, filters);

            useMasteryStore.setState((state) => ({
                items: { ...state.items, [itemId]: updatedItem },
                itemIds: needsRemoval
                    ? state.itemIds.filter((id) => id !== itemId)
                    : state.itemIds,
            }));

            try {
                await masteryService.setMastery(itemId, field);
                const finalStats = await masteryService.getMasteryStats(
                    activeCategory,
                    INITIAL_FILTERS,
                );
                useMasteryStore.setState({ stats: finalStats });
            } catch (err) {
                error(`Rollback: ${err}`);
                useMasteryStore.setState(previousState);
            }
        },
    },
}));

export const useMasteryActions = () => useMasteryStore((s) => s.actions);
export const useMasteryItemIds = masteryBundle.useItemIds;
export const useItemById = masteryBundle.useItemById;
export const useMasteryStats = masteryBundle.useStats;

useMasteryStore.getState().actions.fetchData();
