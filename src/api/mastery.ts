import { invoke } from "@tauri-apps/api/core";
import { Item, MasteryStats } from "@/types/items";
import { MasteryCategory } from "@/types/categories";
import { MasteryFilterState } from "@/types/filters";

export const masteryService = {
    getItems: (
        category: MasteryCategory,
        search: string,
        filters: MasteryFilterState,
        limit: number,
        offset: number,
    ): Promise<Item[]> =>
        invoke<Item[]>("get_items", {
            category,
            search,
            filters,
            limit,
            offset,
        }),

    getMasteryStats: (
        category: MasteryCategory,
        filters: MasteryFilterState,
    ): Promise<MasteryStats> =>
        invoke<MasteryStats>("get_mastery_stats", { category, filters }),

    setComponent: (
        itemId: string,
        componentName: string,
        quantity: number,
    ): Promise<void> =>
        invoke("set_component", {
            itemId,
            componentName,
            quantity,
        }),

    setMastery: (
        itemId: string,
        field: "mastered" | "owned" | "helminthed",
    ): Promise<void> => invoke("set_mastery", { itemId, field }),
};
