import { useLocation } from "react-router-dom";
import { useInventoryStore } from "../store/useInventoryStore";
import { useWeeklyStore } from "../store/useWeeklyStore";
import { ROUTE_REGISTRY } from "../routes/metadata";
import { MASTERY_CATEGORIES } from "../types/inventory";
import { WEEKLY_CATEGORIES } from "../types/weekly";
import { NormalizedStore } from "../types/store";

export function useActiveStore() {
    const { pathname } = useLocation();
    const meta = ROUTE_REGISTRY[pathname];
    const isWeekly = meta?.storeType === "weekly";

    const invStore = useInventoryStore();
    const weeklyStore = useWeeklyStore();

    const store: NormalizedStore = isWeekly
        ? {
              data: weeklyStore.tasks,
              loading: weeklyStore.isLoading,
              search: weeklyStore.search,
              setSearch: weeklyStore.setSearch,
              activeCategory: weeklyStore.activeCategory,
              filters: weeklyStore.filters,
              toggleFilter: weeklyStore.toggleFilter,
          }
        : {
              data: invStore.items,
              loading: invStore.loading,
              search: invStore.search,
              setSearch: invStore.setSearch,
              activeCategory: invStore.activeCategory,
              filters: invStore.filters,
              toggleFilter: invStore.toggleFilter,
          };

    const updateCategory = (cat: string) => {
        if (isWeekly) {
            weeklyStore.setActiveCategory(cat as any);
            weeklyStore.fetchTasks();
        } else {
            invStore.setActiveCategory(cat as any);
        }
    };

    return {
        store,
        isWeekly,
        categories: isWeekly ? WEEKLY_CATEGORIES : MASTERY_CATEGORIES,
        currentRouteKey: isWeekly ? "weekly" : "mastery",
        updateCategory,
        rawInv: invStore,
        rawWeekly: weeklyStore,
        meta,
        pathname,
    };
}
