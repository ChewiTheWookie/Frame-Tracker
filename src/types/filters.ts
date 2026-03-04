import { TAG_FILTER_MAP } from "./weekly";

export interface FilterConfig {
    key: string;
    name: string;
    routes?: string[];
}

//prettier-ignore
export const MASTERY_FILTERS: FilterConfig[] = [
    { key: "nonPrimesOnly", name: "HIDE PRIMES", routes: ["mastery"] },
    { key: "primesOnly", name: "HIDE NON PRIMES", routes: ["mastery"] },
    { key: "hideUnowned", name: "HIDE UNOWNED", routes: ["mastery"] },
    { key: "craftableOnly", name: "HIDE CRAFTABLE", routes: ["mastery"] },
    { key: "ownedOnly", name: "HIDE OWNED", routes: ["mastery"] },
    { key: "hideOwned", name: "HIDE MASTERED", routes: ["mastery"] },
    { key: "hideFed", name: "HIDE HELMINTHED", routes: ["mastery"] },
];

const WEEKLY_TAG_FILTERS: FilterConfig[] = Object.keys(TAG_FILTER_MAP).map(
    (key) => ({
        key,
        name: key.replace(/([A-Z])/g, " $1").toUpperCase(),
        routes: ["weekly"],
    }),
);

//prettier-ignore
export const FILTERS_DEFINITION: FilterConfig[] = [
    { key: "showAllBacks", name: "SHOW ALL BACKS", routes: ["mastery", "weekly"] },
    { key: "hideCompleted", name: "HIDE COMPLETED", routes: ["weekly"] },
    { key: "hideIncompleted", name: "HIDE INCOMPLETED", routes: ["weekly"] },
    ...MASTERY_FILTERS,
    ...WEEKLY_TAG_FILTERS,
];

export const getFilters = (store: any, currentRouteKey: string | undefined) => {
    if (!currentRouteKey) return [];

    return (FILTERS_DEFINITION as readonly FilterConfig[])
        .filter((tab) => tab.routes?.includes(currentRouteKey))
        .map((tab) => {
            if (tab.key === "showAllBacks") {
                return {
                    ...tab,
                    checked: store.showAllBacks,
                    onChange: store.toggleShowAllBacks,
                };
            }
            return {
                ...tab,
                checked: store.filters[tab.key as keyof typeof store.filters],
                onChange: () => store.toggleFilter(tab.key as any),
            };
        });
};
