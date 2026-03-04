import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { MasteryCategories, Item } from "../types/inventory";

type ActiveCategory = MasteryCategories | "All";

interface UserProgress {
    [itemId: string]: {
        mastered: boolean;
        helminthed: boolean;
        owned: boolean;
        craftable: boolean;
        parts: Record<string, boolean>;
    };
}

interface InventoryState {
    items: Item[];
    allItems: Item[];
    loading: boolean;
    activeCategory: ActiveCategory;
    setActiveCategory: (cat: ActiveCategory) => void;
    userProgress: UserProgress;
    saving: boolean;
    fetchWikiData: () => Promise<void>;
    toggleStatus: (
        id: string,
        field: "mastered" | "helminthed" | "owned",
    ) => Promise<void>;
    togglePart: (itemId: string, partName: string) => Promise<void>;
    search: string;
    setSearch: (val: string) => void;
    filters: {
        nonPrimesOnly: boolean;
        primesOnly: boolean;
        hideFed: boolean;
        hideOwned: boolean;
        hideUnowned: boolean;
        craftableOnly: boolean;
        ownedOnly: boolean;
    };
    toggleFilter: (key: keyof InventoryState["filters"]) => void;
    showAllBacks: boolean;
    toggleShowAllBacks: () => void;
    visibleCount: number;
    loadMore: () => void;
    resetVisibleCount: () => void;
}

let searchDebounceTimer: ReturnType<typeof setTimeout>;
let currentSearchId = 0;

export const useInventoryStore = create<InventoryState>((set, get) => ({
    items: [],
    allItems: [],
    loading: false,
    activeCategory: "All",
    userProgress: {},
    saving: false,
    search: "",
    filters: {
        nonPrimesOnly: false,
        primesOnly: false,
        hideFed: false,
        hideOwned: false,
        hideUnowned: false,
        craftableOnly: false,
        ownedOnly: false,
    },
    showAllBacks: false,

    visibleCount: 50,

    loadMore: () => set((state) => ({ visibleCount: state.visibleCount + 50 })),

    resetVisibleCount: () => set({ visibleCount: 50 }),

    fetchWikiData: async () => {
        const requestId = ++currentSearchId;
        const state = get();

        set({ loading: true });

        try {
            const filteredItems: Item[] = await invoke("fetch_wiki_data", {
                search: state.search,
                activeCategory: state.activeCategory,
                filters: state.filters,
            });

            if (state.allItems.length === 0) {
                const fullList: Item[] = await invoke("fetch_wiki_data", {
                    search: "",
                    activeCategory: "All",
                    filters: {
                        nonPrimesOnly: false,
                        primesOnly: false,
                        hideFed: false,
                        hideOwned: false,
                        hideUnowned: false,
                        craftableOnly: false,
                        ownedOnly: false,
                    },
                });
                set({ allItems: fullList });
            }

            if (requestId === currentSearchId) {
                const progressMap: UserProgress = {};
                filteredItems.forEach((item) => {
                    progressMap[item.id] = {
                        mastered: item.mastered,
                        helminthed: item.helminthed,
                        owned: item.owned,
                        craftable: item.craftable,
                        parts: item.parts,
                    };
                });

                set({
                    items: filteredItems,
                    userProgress: progressMap,
                    loading: false,
                });
            }
        } catch (error) {
            if (requestId === currentSearchId) {
                console.error("Failed to fetch data:", error);
                set({ loading: false });
            }
        }
    },

    setSearch: (val) => {
        set({ search: val, visibleCount: 50 });

        clearTimeout(searchDebounceTimer);

        searchDebounceTimer = setTimeout(async () => {
            const requestId = ++currentSearchId;
            const { search, activeCategory, filters } = get();

            set({ loading: true });
            try {
                const mergedItems = await invoke("fetch_wiki_data", {
                    search,
                    activeCategory,
                    filters,
                });

                if (requestId === currentSearchId) {
                    set({ items: mergedItems as Item[], loading: false });
                }
            } catch (e) {
                if (requestId === currentSearchId) {
                    console.error(e);
                    set({ loading: false });
                }
            }
        }, 200);
    },

    setActiveCategory: (cat) => {
        set({ activeCategory: cat, visibleCount: 50 });
        get().fetchWikiData();
    },

    toggleFilter: (key) =>
        set((state) => {
            const newFilters = { ...state.filters, [key]: !state.filters[key] };
            if (newFilters[key]) {
                if (key === "primesOnly") newFilters.nonPrimesOnly = false;
                if (key === "nonPrimesOnly") newFilters.primesOnly = false;
            }
            set({ visibleCount: 50 });
            setTimeout(() => get().fetchWikiData(), 0);
            return { filters: newFilters };
        }),

    togglePart: async (id, partName) => {
        const state = get();
        const item = state.allItems.find((i) => i.id === id);
        if (!item) return;

        set({ saving: true });

        const updatedParts = {
            ...item.parts,
            [partName]: !item.parts?.[partName],
        };

        const allPartsChecked = Object.values(updatedParts).every(
            (v) => v === true,
        );
        const shouldBeCraftable =
            allPartsChecked && !item.owned && !item.mastered;

        const updatedProgress = {
            ...(state.userProgress[id] || {
                mastered: false,
                owned: false,
                helminthed: false,
                craftable: false,
                parts: {},
            }),
            parts: updatedParts,
            craftable: shouldBeCraftable,
        };

        const updatedItem = { ...item, ...updatedProgress };

        set({
            items: state.items.map((i) => (i.id === id ? updatedItem : i)),
            allItems: state.allItems.map((i) =>
                i.id === id ? updatedItem : i,
            ),
            userProgress: { ...state.userProgress, [id]: updatedProgress },
        });

        saveProgress(id, updatedProgress).then(() => set({ saving: false }));
    },

    toggleStatus: async (id, field) => {
        const state = get();
        const item = state.allItems.find((i) => i.id === id);
        if (!item) return;

        set({ saving: true });
        const updatedStatus = {
            mastered: field === "mastered" ? !item.mastered : item.mastered,
            owned: field === "owned" ? !item.owned : item.owned,
            helminthed:
                field === "helminthed" ? !item.helminthed : item.helminthed,
        };

        const allPartsChecked = Object.values(item.parts || {}).every(
            (v) => v === true,
        );
        const isCraftable =
            allPartsChecked && !updatedStatus.owned && !updatedStatus.mastered;

        const updatedProgress = {
            ...(state.userProgress[id] || {
                mastered: false,
                owned: false,
                helminthed: false,
                craftable: false,
                parts: {},
            }),
            ...updatedStatus,
            craftable: isCraftable,
        };

        const updatedItem = { ...item, ...updatedProgress };

        set({
            items: state.items.map((i) => (i.id === id ? updatedItem : i)),
            allItems: state.allItems.map((i) =>
                i.id === id ? updatedItem : i,
            ),
            userProgress: { ...state.userProgress, [id]: updatedProgress },
        });

        saveProgress(id, updatedProgress).then(() => set({ saving: false }));
    },

    toggleShowAllBacks: () =>
        set((state) => ({ showAllBacks: !state.showAllBacks })),
}));

async function saveProgress(itemId: string, progress: any) {
    try {
        await invoke("save_item_progress", {
            id: itemId,
            progress: progress,
        });
    } catch (e) {
        console.error("Database save failed:", e);
    } finally {
    }
}
