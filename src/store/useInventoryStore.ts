import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { load, Store } from "@tauri-apps/plugin-store";
import { Category, Item } from "../types/inventory";
import { RESOURCES } from "../types/resources";
import { INVENTORY_EXCLUSIONS } from "../types/inventoryExclusions";
import { CATEGORY_KEYWORDS } from "../types/inventoryMapping";

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

const getCategory = (id: string, name: string): Category => {
    if (CATEGORY_KEYWORDS.MODULAR.some((k) => id.includes(k))) return "Modular";
    if (CATEGORY_KEYWORDS.ARCH_WEAPONS.some((k) => id.includes(k)))
        return "Arch Weapons";
    if (CATEGORY_KEYWORDS.VEHICLES.some((k) => id.includes(k) || name === k))
        return "Vehicles";
    if (CATEGORY_KEYWORDS.COMPANIONS.some((k) => id.includes(k)))
        return "Companions";
    if (CATEGORY_KEYWORDS.WARFRAMES.some((k) => id.includes(k)))
        return "Warframes";

    if (id.includes("/Weapons/")) {
        if (CATEGORY_KEYWORDS.SECONDARY.some((k) => id.includes(k)))
            return "Secondary";
        if (CATEGORY_KEYWORDS.MELEE.some((k) => id.includes(k))) return "Melee";

        return "Primary";
    }

    return "Unknown";
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

            const rawData: any[] = await invoke("fetch_wiki_data");

            const wikiData = rawData.filter((item) => {
                const id = item.uniqueName;

                const isBlacklisted = INVENTORY_EXCLUSIONS.some((excluded) =>
                    id.includes(excluded),
                );

                return !isBlacklisted;
            });

            const merged = wikiData.map((item) => {
                const id = item.uniqueName;
                const name = item.name;

                const category = getCategory(id, name);

                const saved = savedData[id] || {};

                if (category === "Unknown") {
                    console.log(
                        `%c[UNCATEGORIZED]: ${name} | Path: ${id}`,
                        "color: orange",
                    );
                }

                const filteredComponents = (item.components || [])
                    .filter((comp: any) => !RESOURCES.includes(comp.name))
                    .map((comp: any) => {
                        const partStatus = saved.parts?.[comp.name] ?? false;
                        return [comp.name, partStatus];
                    });

                let parts = Object.fromEntries(filteredComponents);
                if (Object.keys(parts).length === 0) {
                    parts = { Blueprint: saved.parts?.Blueprint ?? false };
                }

                const isWarframe = category === "Warframes";
                const isNecraMech = name === "Voidrig" || name === "Bonewidow";
                const isPrime = name.includes("Prime");
                const isFeedable = isWarframe && !isPrime && !isNecraMech;

                return {
                    id: item.uniqueName,
                    name: item.name,
                    image: `https://cdn.warframestat.us/img/${item.imageName}`,
                    category,
                    mastered: saved.mastered ?? false,
                    helminthed: saved.helminthed ?? false,
                    owned: saved.owned ?? false,
                    craftable: saved.craftable ?? false,
                    isFeedable,
                    parts: parts,
                };
            });

            set({ items: merged, userProgress: savedData, loading: false });
        } catch (error) {
            console.error("Failed to fetch wiki data:", error);
        }
    },

    togglePart: async (itemId, partName) => {
        set({ saving: true });

        set((state) => {
            const itemIndex = state.items.findIndex((i) => i.id === itemId);
            if (itemIndex === -1) return { saving: false };

            const currentItem = state.items[itemIndex];
            const currentParts = currentItem.parts ?? {};

            const updatedParts = {
                ...currentParts,
                [partName]: !currentParts[partName],
            };

            const allPartsChecked = Object.values(updatedParts).every(
                (status) => status === true,
            );

            const isOwned = currentItem.owned ?? false;
            const shouldBeCraftable = allPartsChecked && !isOwned;

            const currentProgress = state.userProgress[itemId] || {
                mastered: currentItem.mastered,
                helminthed: currentItem.helminthed,
                owned: isOwned,
                craftable: false,
                parts: {},
            };

            const newUserProgress = {
                ...state.userProgress,
                [itemId]: {
                    ...currentProgress,
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

            saveProgressToDisk(newUserProgress).then(() => {
                set({ saving: false });
            });

            return {
                items: newItems,
                userProgress: newUserProgress,
            };
        });
    },

    toggleStatus: async (id, field) => {
        set({ saving: true });

        set((state) => {
            const itemIndex = state.items.findIndex((i) => i.id === id);
            if (itemIndex === -1) return { saving: false };

            const currentItem = state.items[itemIndex];

            const isMastered =
                field === "mastered"
                    ? !currentItem.mastered
                    : currentItem.mastered;
            const isOwned =
                field === "owned" ? !currentItem.owned : currentItem.owned;
            const isHelminthed =
                field === "helminthed"
                    ? !currentItem.helminthed
                    : currentItem.helminthed;

            const currentParts = currentItem.parts ?? {};
            const allPartsChecked = Object.values(currentParts).every(
                (val) => val === true,
            );

            let isCraftable = allPartsChecked && !isOwned && !isMastered;

            const updatedStatus = {
                mastered: isMastered,
                owned: isOwned,
                helminthed: isHelminthed,
                craftable: isCraftable,
            };

            const currentEntry = state.userProgress[id] || {
                parts: currentParts,
            };
            const updatedEntry = {
                ...currentEntry,
                ...updatedStatus,
                parts: currentParts,
            };

            const newUserProgress = {
                ...state.userProgress,
                [id]: updatedEntry,
            };
            const newItems = [...state.items];
            newItems[itemIndex] = { ...currentItem, ...updatedStatus };

            saveProgressToDisk(newUserProgress).then(() =>
                set({ saving: false }),
            );

            return {
                items: newItems,
                userProgress: newUserProgress,
            };
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
