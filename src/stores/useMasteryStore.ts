import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { MasteryCategory } from "../types/categories";
import { MasteryFilterState } from "../types/filters";
import { Item, ItemComponent } from "../types/items";

export interface MasteryStats {
    current: number;
    total: number;
    helminthCurrent: number;
    helminthTotal: number;
}

interface MasteryState {
    items: Record<string, Item>;
    itemIds: string[];
    activeCategory: MasteryCategory;
    stats: MasteryStats;
    searchQuery: string;
    filters: MasteryFilterState;
    isLoading: boolean;
    page: number;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    error: string | null;

    setCategory: (category: MasteryCategory) => void;
    setSearch: (query: string) => void;

    setFilters: (filters: MasteryFilterState) => void;
    fetchItems: (silent?: boolean) => Promise<void>;
    updateComponentQuantity: (
        itemId: string,
        componentName: string,
        quantity: number,
    ) => void;
    toggleMastery: (
        itemId: string,
        field: "mastered" | "owned" | "helminthed",
    ) => void;
}

const TOTAL_VISIBLE = 50;

export const useMasteryStore = create<MasteryState>((set, get) => ({
    items: {},
    itemIds: [],
    activeCategory: "All" as MasteryCategory,
    stats: { current: 0, total: 0, helminthCurrent: 0, helminthTotal: 0 },
    searchQuery: "",
    filters: {
        type: "mastery",
        hideNonPrime: false,
        hidePrime: false,

        hideUnowned: false,
        hideCraftable: false,
        hideOwned: false,
        hideMastered: false,
        hideHelminthed: false,
    },
    isLoading: true,
    page: 0,
    hasMore: true,
    error: null,

    setCategory: (category) => {
        if (get().activeCategory === category) return;
        set({
            activeCategory: category,
            searchQuery: "",
            page: 0,
            items: {},
            itemIds: [],
            hasMore: true,
            isLoading: true,
        });
        get().fetchItems();
    },

    setSearch: (query) => {
        set({
            searchQuery: query,
            page: 0,
            items: {},
            itemIds: [],
            hasMore: true,
        });
        get().fetchItems(true);
    },

    setFilters: (newFilters: MasteryFilterState) => {
        set({
            filters: newFilters,
            page: 0,
            items: {},
            itemIds: [],
            hasMore: true,
        });
        get().fetchItems(true);
    },

    loadMore: async () => {
        const { isLoading, hasMore, page, itemIds } = get();

        if (isLoading || !hasMore || itemIds.length === 0) return;

        set({ page: page + 1 });
        await get().fetchItems(true);
    },

    fetchItems: async (silent = false) => {
        if (get().isLoading && silent) return;

        const { searchQuery, activeCategory, filters, page } = get();

        const requestContext = {
            search: searchQuery,
            cat: activeCategory,
            filt: JSON.stringify(filters),
            pg: page,
        };

        if (!silent) set({ isLoading: true, error: null });
        else set({ isLoading: true });

        try {
            const [itemsArray, stats] = await Promise.all([
                invoke<Item[]>("get_items", {
                    category: activeCategory,
                    search: searchQuery,
                    filters: filters,
                    limit: TOTAL_VISIBLE,
                    offset: page * TOTAL_VISIBLE,
                }),
                invoke<MasteryStats>("get_mastery_stats", {
                    category: activeCategory,
                }),
            ]);

            const current = get();
            if (
                requestContext.search !== current.searchQuery ||
                requestContext.cat !== current.activeCategory ||
                requestContext.filt !== JSON.stringify(current.filters) ||
                requestContext.pg !== current.page
            ) {
                return;
            }

            set((state) => {
                const newItemsMap = { ...state.items };
                const newItemIds = [...state.itemIds];

                itemsArray.forEach((item) => {
                    if (!newItemsMap[item.id]) {
                        newItemsMap[item.id] = item;
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
            set({ error: String(err), isLoading: false });
        }
    },

    updateComponentQuantity: async (itemId, componentName, quantity) => {
        set((state) => {
            const item = state.items[itemId];
            if (!item) return state;

            const updatedComponents = item.components.map(
                (c: ItemComponent) => {
                    if (c.componentName !== componentName) return c;
                    const clampedQuantity = Math.min(
                        Math.max(0, quantity),
                        c.neededQuantity,
                    );
                    return { ...c, ownedQuantity: clampedQuantity };
                },
            );

            const isNowCraftable = updatedComponents.every(
                (c) => c.ownedQuantity >= c.neededQuantity,
            );

            const updatedItem = {
                ...item,
                components: updatedComponents,
                craftable: isNowCraftable,
            };

            return {
                items: { ...state.items, [itemId]: updatedItem },
            };
        });

        const finalItem = get().items[itemId];
        const finalComp = finalItem?.components.find(
            (c) => c.componentName === componentName,
        );

        if (finalComp) {
            try {
                await invoke("set_component", {
                    itemId,
                    componentName,
                    quantity: finalComp.ownedQuantity,
                });
            } catch (err) {
                console.error(err);
                set({ page: 0, items: {}, itemIds: [] });
                get().fetchItems();
            }
        }
    },

    toggleMastery: async (itemId, field) => {
        const currentItem = get().items[itemId];
        if (!currentItem) return;

        const oldValue = currentItem[field];
        const newValue = !oldValue;

        set((state) => ({
            items: {
                ...state.items,
                [itemId]: { ...currentItem, [field]: newValue },
            },
        }));

        try {
            await invoke("set_mastery", { itemId, field });

            const finalStats = await invoke<MasteryStats>("get_mastery_stats", {
                category: get().activeCategory,
            });
            set({ stats: finalStats });
        } catch (err) {
            set((state) => ({
                items: {
                    ...state.items,
                    [itemId]: { ...currentItem, [field]: oldValue },
                },
            }));
        }
    },
}));

listen("db-initial-sync-complete", () => {
    const state = useMasteryStore.getState();

    if (state.itemIds.length > 0) {
        state.fetchItems(true);
    } else {
        state.fetchItems();
    }
});

useMasteryStore.getState().fetchItems();

export const useItemById = (id: string) =>
    useMasteryStore((state) => state.items[id]);
