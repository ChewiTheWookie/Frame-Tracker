export type MasteryFilterState = {
    type: "mastery";

    hideNonPrime: boolean;
    hidePrime: boolean;

    hideUnowned: boolean;
    hideCraftable: boolean;
    hideOwned: boolean;
    hideMastered: boolean;
    hideHelminthed: boolean;
};

export type TaskFilterState = {
    type: "tasks";

    hideIncomplete: boolean;
    hideComplete: boolean;

    favoriteFirst: boolean;
    hideFavorite: boolean;
    hideNonFavorite: boolean;
};

export type FilterState = MasteryFilterState | TaskFilterState;

//? Mapping for labels

export interface FilterDef {
    id: string;
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
}

export const getFilterDefinitions = (
    filters: FilterState,
    setFilters: (f: FilterState) => void,
): FilterDef[] => {
    const labels: Record<string, string> = {
        hideNonPrime: "Hide Non Primes",
        hidePrime: "Hide Primes",
        hideUnowned: "Hide Unowned",
        hideCraftable: "Hide Craftable",
        hideOwned: "Hide Owned",
        hideMastered: "Hide Mastered",
        hideHelminthed: "Hide Helminthed",
        favoriteFirst: "Favorites First",
        hideIncomplete: "Hide Incomplete",
        hideComplete: "Hide Complete",
        hideFavorite: "Hide Favorites",
        hideNonFavorite: "Hide Non Favorites",
    };

    return Object.entries(filters)
        .filter(([key]) => key !== "type")
        .map(([key, value]) => ({
            id: key,
            label: labels[key] || key,
            checked: value as boolean,
            onChange: (val) => setFilters({ ...filters, [key]: val }),
        }));
};

//? Statbar Filters
export type TaskStatFilterState = {
    type: "tasks";
    hideFavorite: boolean;
    hideNonFavorite: boolean;
};

export type MasteryStatFilterState = {
    type: "mastery";
    hideNonPrime: boolean;
    hidePrime: boolean;
};

export type StatFilterState = MasteryStatFilterState | TaskStatFilterState;

export interface StatFilterDef {
    id: string;
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
}

export const getStatFilterDefinitions = (
    filters: StatFilterState,
    setStatFilters: (f: StatFilterState) => void,
): StatFilterDef[] => {
    const labels: Record<string, string> = {
        hideFavorite: "Non Favorites",
        hideNonFavorite: "Favorites",

        hideNonPrime: "Primes",
        hidePrime: "Non Primes",
    };

    return Object.entries(filters)
        .filter(([key]) => key !== "type")
        .map(([key, value]) => ({
            id: key,
            label: labels[key] || key,
            checked: value as boolean,
            onChange: (val) => setStatFilters({ ...filters, [key]: val }),
        }));
};
