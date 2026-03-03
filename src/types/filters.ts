export interface FilterConfig {
    key: string;
    name: string;
    routes?: string[];
}

export const FILTERS_DEFINITION: FilterConfig[] = [
    { key: "showAllBacks", name: "SHOW ALL BACKS", routes: ["mastery"] },
    { key: "nonPrimesOnly", name: "HIDE PRIMES", routes: ["mastery"] },
    { key: "primesOnly", name: "HIDE NON PRIMES", routes: ["mastery"] },
    { key: "hideUnowned", name: "HIDE UNOWNED", routes: ["mastery"] },
    { key: "craftableOnly", name: "HIDE CRAFTABLE", routes: ["mastery"] },
    { key: "ownedOnly", name: "HIDE OWNED", routes: ["mastery"] },
    { key: "hideOwned", name: "HIDE MASTERED", routes: ["mastery"] },
    { key: "hideFed", name: "HIDE HELMINTHED", routes: ["mastery"] },
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
