import { useLocation } from "react-router-dom";
import { useInventoryStore } from "../store/useInventoryStore";
import { useWeeklyStore } from "../store/useWeeklyStore";
import { ROUTE_REGISTRY } from "../routes/metadata";
import { MASTERY_CATEGORIES, MasteryCategories } from "../types/inventory";
import { WEEKLY_CATEGORIES, WeeklyCategories } from "../types/weekly";

export function useActiveStore() {
    const { pathname } = useLocation();
    const meta = ROUTE_REGISTRY[pathname];

    const invStore = useInventoryStore();
    const weeklyStore = useWeeklyStore();

    const isWeekly = meta?.storeType === "weekly";
    const activeStore = isWeekly ? weeklyStore : invStore;

    const categories = isWeekly ? WEEKLY_CATEGORIES : MASTERY_CATEGORIES;
    const currentRouteKey = isWeekly ? "weekly" : "mastery";

    const updateCategory = (cat: string) => {
        if (isWeekly) {
            weeklyStore.setActiveCategory(cat as WeeklyCategories);
        } else {
            invStore.setActiveCategory(cat as MasteryCategories);
        }
    };

    return {
        store: activeStore,
        isWeekly,
        storeType: meta?.storeType,
        meta,
        categories,
        currentRouteKey,
        updateCategory,
        pathname,
    };
}
