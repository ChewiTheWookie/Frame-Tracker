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
            masteryService.getMasteryStats(category),
        ]);
        return [itemsArray, stats];
    },
});

export const useMasteryStore = masteryBundle.useStore;

useMasteryStore.setState((state) => ({
    actions: {
        ...state.actions,

        updateComponentQuantity: async (
            itemId: string,
            componentName: string,
            quantity: number
        ) => {
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
                quantity
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
                    (c) => c.componentName === componentName
                );
                await masteryService.setComponent(
                    itemId,
                    componentName,
                    component!.ownedQuantity
                );
            } catch (err) {
                console.error("Rollback:", err);
                useMasteryStore.setState(previousState);
            }
        },

        toggleMastery: async (
            itemId: string,
            field: "mastered" | "owned" | "helminthed"
        ) => {
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
                !item[field]
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
                const finalStats =
                    await masteryService.getMasteryStats(activeCategory);
                useMasteryStore.setState({ stats: finalStats });
            } catch (err) {
                console.error("Rollback:", err);
                useMasteryStore.setState(previousState);
            }
        },
    },
}));

export const useMasteryActions = masteryBundle.useActions;
export const useMasteryItemIds = masteryBundle.useItemIds;
export const useItemById = masteryBundle.useItemById;
export const useMasteryStats = masteryBundle.useStats;

useMasteryStore.getState().actions.fetchData();
