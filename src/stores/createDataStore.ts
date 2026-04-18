import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { BaseState } from "@/types/store";

interface StoreConfig<T, F, S, C> {
    initialFilters: F;
    initialStats: S;
    fetchItems: (args: {
        category: C;
        query: string;
        filters: F;
        limit: number;
        offset: number;
    }) => Promise<[T[], S]>;
}

interface DataActions<F, C> {
    setCategory: (category: C) => void;
    setSearch: (query: string) => void;
    setFilters: (newFilters: F) => void;
    fetchData: (silent?: boolean) => Promise<void>;
    loadMore: () => Promise<void>;
}

export const createDataStore = <T extends { id: string }, F, S, C>(
    config: StoreConfig<T, F, S, C>,
) => {
    const TOTAL_VISIBLE = 50;
    let fetchVersion = 0;

    const getDefaultResultState = () => ({
        page: 0,
        items: {} as Record<string, T>,
        itemIds: [] as string[],
        hasMore: true,
    });

    const useStore = create<
        BaseState<T, F, S, C> & { actions: DataActions<F, C> }
    >((set, get) => ({
        ...getDefaultResultState(),
        activeCategory: "All" as unknown as C,
        stats: config.initialStats,
        searchQuery: "",
        filters: config.initialFilters,
        isLoading: false,
        isFetchingMore: false,
        error: null,

        actions: {
            setCategory: (category: C) => {
                if (get().activeCategory === category) return;
                set({
                    ...getDefaultResultState(),
                    activeCategory: category,
                    searchQuery: "",
                });
                get().actions.fetchData();
            },

            setSearch: (query: string) => {
                if (get().searchQuery === query) return;
                set({
                    ...getDefaultResultState(),
                    searchQuery: query,
                });
                get().actions.fetchData(true);
            },

            setFilters: (newFilters: F) => {
                set({
                    ...getDefaultResultState(),
                    filters: newFilters,
                });
                get().actions.fetchData(true);
            },

            fetchData: async (silent = false) => {
                const state = get();
                if (!silent && (state.isLoading || state.isFetchingMore))
                    return;

                const version = ++fetchVersion;
                const { searchQuery, activeCategory, filters, page } = get();

                if (!silent) set({ isLoading: true, error: null });

                try {
                    const [itemsArray, stats] = await config.fetchItems({
                        category: activeCategory,
                        query: searchQuery,
                        filters: filters,
                        limit: TOTAL_VISIBLE,
                        offset: page * TOTAL_VISIBLE,
                    });

                    if (version !== fetchVersion) return;

                    set((state) => {
                        const newMap = { ...state.items };
                        const newIds = page === 0 ? [] : [...state.itemIds];

                        itemsArray.forEach((item) => {
                            newMap[item.id] = item;
                            if (!newIds.includes(item.id)) newIds.push(item.id);
                        });

                        return {
                            items: newMap,
                            itemIds: newIds,
                            stats,
                            isLoading: false,
                            hasMore: itemsArray.length === TOTAL_VISIBLE,
                        };
                    });
                } catch (err) {
                    if (version === fetchVersion) {
                        set({ error: String(err), isLoading: false });
                    }
                }
            },

            loadMore: async () => {
                const { isLoading, isFetchingMore, hasMore, page, itemIds } =
                    get();
                if (
                    isLoading ||
                    isFetchingMore ||
                    !hasMore ||
                    itemIds.length === 0
                )
                    return;

                set({ isFetchingMore: true, page: page + 1 });
                await get().actions.fetchData(true);
                set({ isFetchingMore: false });
            },
        },
    }));

    return {
        useStore,
        useActions: () => useStore((s) => s.actions),
        useItemIds: () => useStore(useShallow((s) => s.itemIds)),
        useItemById: (id: string) => useStore((s) => s.items[id]),
        useStats: () => useStore(useShallow((s) => s.stats)),
    };
};
