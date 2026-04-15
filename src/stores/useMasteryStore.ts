import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { masteryService, type MasteryStats } from "@/api/mastery";
import { type MasteryCategory } from "@/types/categories";
import { type MasteryFilterState } from "@/types/filters";
import { type Item } from "@/types/items";
import { shouldHide } from "@/utils/shouldHideObject";
import {
    calculateComponentQuantity,
    calculateMasteryToggle,
} from "@/utils/itemLogic";

interface MasteryState {
    items: Record<string, Item>;
    itemIds: string[];
    stats: MasteryStats;
    isLoading: boolean;
    isFetchingMore: boolean;
    error: string | null;
    page: number;
    hasMore: boolean;
    activeCategory: MasteryCategory;
    searchQuery: string;
    filters: MasteryFilterState;

    actions: {
        setCategory: (category: MasteryCategory) => void;
        setSearch: (query: string) => void;
        setFilters: (filters: MasteryFilterState) => void;
        loadMore: () => Promise<void>;
        fetchItems: (silent?: boolean) => Promise<void>;
        updateComponentQuantity: (
            itemId: string,
            componentName: string,
            quantity: number,
        ) => Promise<void>;
        toggleMastery: (
            itemId: string,
            field: "mastered" | "owned" | "helminthed",
        ) => Promise<void>;
    };
}

const TOTAL_VISIBLE = 50;
let fetchVersion = 0;

const getDefaultResultState = () => ({
    page: 0,
    items: {} as Record<string, Item>,
    itemIds: [] as string[],
    hasMore: true,
});

export const useMasteryStore = create<MasteryState>((set, get) => ({
    ...getDefaultResultState(),
    activeCategory: "All" as MasteryCategory,
    stats: { current: 0, total: 0, helminthCurrent: 0, helminthTotal: 0 },
    searchQuery: "",
    filters: {
        type: "mastery" as const,
        hideNonPrime: false,
        hidePrime: false,
        hideUnowned: false,
        hideCraftable: false,
        hideOwned: false,
        hideMastered: false,
        hideHelminthed: false,
    },
    isLoading: true,
    isFetchingMore: false,
    error: null,

    actions: {
        setCategory: (category) => {
            if (get().activeCategory === category) return;
            set({
                ...getDefaultResultState(),
                activeCategory: category,
                searchQuery: "",
                isLoading: true,
            });
            get().actions.fetchItems();
        },

        setSearch: (query) => {
            set({ ...getDefaultResultState(), searchQuery: query });
            get().actions.fetchItems(true);
        },

        setFilters: (newFilters) => {
            set({ ...getDefaultResultState(), filters: newFilters });
            get().actions.fetchItems(true);
        },

        loadMore: async () => {
            const { isLoading, isFetchingMore, hasMore, page, itemIds } = get();
            if (isLoading || isFetchingMore || !hasMore || itemIds.length === 0)
                return;

            set({ isFetchingMore: true, page: page + 1 });
            await get().actions.fetchItems(true);
            set({ isFetchingMore: false });
        },

        fetchItems: async (silent = false) => {
            fetchVersion++;
            const currentVersion = fetchVersion;
            const { searchQuery, activeCategory, filters, page } = get();

            if (!silent) set({ isLoading: true, error: null });

            try {
                const [itemsArray, stats] = await Promise.all([
                    masteryService.getItems(
                        activeCategory,
                        searchQuery,
                        filters,
                        TOTAL_VISIBLE,
                        page * TOTAL_VISIBLE,
                    ),
                    masteryService.getMasteryStats(activeCategory),
                ]);

                if (currentVersion !== fetchVersion) return;

                set((state) => {
                    const newItemsMap = { ...state.items };
                    const newItemIds = page === 0 ? [] : [...state.itemIds];

                    itemsArray.forEach((item) => {
                        newItemsMap[item.id] = item;
                        if (!newItemIds.includes(item.id)) {
                            newItemIds.push(item.id);
                        }
                    });

                    return {
                        items: newItemsMap,
                        itemIds: newItemIds,
                        stats,
                        isLoading: false,
                        hasMore: itemsArray.length === TOTAL_VISIBLE,
                    };
                });
            } catch (err) {
                if (currentVersion === fetchVersion) {
                    set({ error: String(err), isLoading: false });
                }
            }
        },

        updateComponentQuantity: async (itemId, componentName, quantity) => {
            const item = get().items[itemId];
            if (!item) return;

            const previousState = {
                items: get().items,
                itemIds: get().itemIds,
            };

            const updatedItem = calculateComponentQuantity(
                item,
                componentName,
                quantity,
            );
            const needsRemoval = shouldHide(updatedItem, get().filters);

            set((state) => ({
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
                console.error("Component update failed, rolling back", err);
                set(previousState);
            }
        },

        toggleMastery: async (itemId, field) => {
            const item = get().items[itemId];
            if (!item) return;

            const previousState = {
                items: get().items,
                itemIds: get().itemIds,
                stats: get().stats,
            };

            const updatedItem = calculateMasteryToggle(
                item,
                field,
                !item[field],
            );
            const needsRemoval = shouldHide(updatedItem, get().filters);

            set((state) => ({
                items: { ...state.items, [itemId]: updatedItem },
                itemIds: needsRemoval
                    ? state.itemIds.filter((id) => id !== itemId)
                    : state.itemIds,
            }));

            try {
                await masteryService.setMastery(itemId, field);
                const finalStats = await masteryService.getMasteryStats(
                    get().activeCategory,
                );
                set({ stats: finalStats });
            } catch (err) {
                console.error("Mastery update failed, rolling back", err);
                set(previousState);
            }
        },
    },
}));

export const useMasteryActions = () => useMasteryStore((s) => s.actions);

export const useMasteryItemIds = () =>
    useMasteryStore(useShallow((state) => state.itemIds));

export const useItemById = (id: string) =>
    useMasteryStore((state) => state.items[id]);

export const useMasteryStats = () =>
    useMasteryStore(useShallow((state) => state.stats));

useMasteryStore.getState().actions.fetchItems();
