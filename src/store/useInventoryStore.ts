import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { load, Store } from "@tauri-apps/plugin-store";
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
    togglePart: (itemId: string, partName: string) => void;

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
    toggleFilter: (
        key:
            | "primesOnly"
            | "hideFed"
            | "nonPrimesOnly"
            | "hideOwned"
            | "hideUnowned"
            | "craftableOnly"
            | "ownedOnly",
    ) => void;

    showAllBacks: boolean;
    toggleShowAllBacks: () => void;
}

let store: Store | null = null;
const getStore = async () => {
    if (!store) {
        store = await load("inventory.json", {
            autoSave: 1000,
            defaults: {},
        });
    }
    return store;
};

export const useInventoryStore = create<InventoryState>((set) => ({
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
            const db = await getStore();
            const savedData =
                (await db.get<UserProgress>("user_progress")) || {};

            const wikiData: any[] = await invoke("fetch_wiki_data");

            const merged = wikiData.map((item) => {
                const saved = savedData[item.id] || {};

                let parts: Record<string, boolean> = {};
                if (item.components && item.components.length > 0) {
                    item.components.forEach((comp: any) => {
                        parts[comp.name] = saved.parts?.[comp.name] ?? false;
                    });
                } else {
                    parts = { Blueprint: saved.parts?.Blueprint ?? false };
                }

                return {
                    ...item,
                    mastered: saved.mastered ?? false,
                    helminthed: saved.helminthed ?? false,
                    owned: saved.owned ?? false,
                    craftable: saved.craftable ?? false,
                    parts,
                };
            });

            set({ items: merged, userProgress: savedData, loading: false });
        } catch (error) {
            console.error(error);
        }
    },

    togglePart: async (itemId, partName) => {
        set({ saving: true });
        set((state) => {
            const itemIndex = state.items.findIndex((i) => i.id === itemId);
            if (itemIndex === -1) return { saving: false };

            const currentItem = state.items[itemIndex];
            const updatedParts = {
                ...currentItem.parts,
                [partName]: !currentItem.parts?.[partName],
            };

            const allPartsChecked = Object.values(updatedParts).every(
                (v) => v === true,
            );
            const shouldBeCraftable = allPartsChecked && !currentItem.owned;

            const newUserProgress = {
                ...state.userProgress,
                [itemId]: {
                    ...(state.userProgress[itemId] || {}),
                    parts: updatedParts,
                    craftable: shouldBeCraftable,
                },
            };

            const newItems = [...state.items];
            newItems[itemIndex] = {
                ...currentItem,
                parts: updatedParts,
                craftable: shouldBeCraftable,
            };

            saveProgressToDisk(newUserProgress).then(() =>
                set({ saving: false }),
            );
            return { items: newItems, userProgress: newUserProgress };
        });
    },

    toggleStatus: async (id, field) => {
        set({ saving: true });
        set((state) => {
            const itemIndex = state.items.findIndex((i) => i.id === id);
            if (itemIndex === -1) return { saving: false };

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
                allPartsChecked &&
                !updatedStatus.owned &&
                !updatedStatus.mastered;

            const newUserProgress = {
                ...state.userProgress,
                [id]: {
                    ...state.userProgress[id],
                    ...updatedStatus,
                    craftable: isCraftable,
                },
            };

            const newItems = [...state.items];
            newItems[itemIndex] = {
                ...item,
                ...updatedStatus,
                craftable: isCraftable,
            };

            saveProgressToDisk(newUserProgress).then(() =>
                set({ saving: false }),
            );
            return { items: newItems, userProgress: newUserProgress };
        });
    },

    toggleFilter: (key) =>
        set((state) => {
            const newFilters = { ...state.filters };

            const filterKey = key as keyof typeof state.filters;
            newFilters[key] = !newFilters[key];

            if (newFilters[key]) {
                switch (filterKey) {
                    case "primesOnly":
                        newFilters.nonPrimesOnly = false;
                        break;
                    case "nonPrimesOnly":
                        newFilters.primesOnly = false;
                        break;
                }
            }

            return { filters: newFilters };
        }),

    toggleShowAllBacks: () =>
        set((state) => ({ showAllBacks: !state.showAllBacks })),
}));

async function saveProgressToDisk(progress: UserProgress) {
    const db = await getStore();
    await db.set("user_progress", progress);
}
