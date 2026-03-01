import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { Category, Item } from "../types/inventory";

type ActiveCategory = Category | "All";

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
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    items: [],
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

    setSearch: (val) => set({ search: val }),
    setActiveCategory: (cat) => set({ activeCategory: cat }),

    fetchWikiData: async () => {
        set({ loading: true });
        try {
            const mergedItems: Item[] = await invoke("fetch_wiki_data");

            const progressMap: UserProgress = {};
            mergedItems.forEach((item) => {
                progressMap[item.id] = {
                    mastered: item.mastered,
                    helminthed: item.helminthed,
                    owned: item.owned,
                    craftable: item.craftable,
                    parts: item.parts,
                };
            });

            set({
                items: mergedItems,
                userProgress: progressMap,
                loading: false,
            });
        } catch (error) {
            console.error("Failed to fetch data:", error);
            set({ loading: false });
        }
    },

    togglePart: async (id, partName) => {
        const state = get();
        const itemIndex = state.items.findIndex((i) => i.id === id);
        if (itemIndex === -1) return;

        set({ saving: true });

        const currentItem = state.items[itemIndex];

        const updatedParts = {
            ...currentItem.parts,
            [partName]: !currentItem.parts?.[partName],
        };

        const allPartsChecked = Object.values(updatedParts).every(
            (v) => v === true,
        );
        const shouldBeCraftable =
            allPartsChecked && !currentItem.owned && !currentItem.mastered;

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

        const newItems = [...state.items];
        newItems[itemIndex] = { ...currentItem, ...updatedProgress };

        set({
            items: newItems,
            userProgress: { ...state.userProgress, [id]: updatedProgress },
        });

        saveProgress(id, updatedProgress).then(() => set({ saving: false }));
    },

    toggleStatus: async (id, field) => {
        const state = get();
        const itemIndex = state.items.findIndex((i) => i.id === id);
        if (itemIndex === -1) return;

        set({ saving: true });
        const item = state.items[itemIndex];

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

        const newItems = [...state.items];
        newItems[itemIndex] = { ...item, ...updatedProgress };

        set({
            items: newItems,
            userProgress: { ...state.userProgress, [id]: updatedProgress },
        });

        saveProgress(id, updatedProgress).then(() => set({ saving: false }));
    },

    toggleFilter: (key) =>
        set((state) => {
            const newFilters = { ...state.filters, [key]: !state.filters[key] };
            if (newFilters[key]) {
                if (key === "primesOnly") newFilters.nonPrimesOnly = false;
                if (key === "nonPrimesOnly") newFilters.primesOnly = false;
            }
            return { filters: newFilters };
        }),

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
