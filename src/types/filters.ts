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
    filters: MasteryFilterState | TaskFilterState,
    setFilters: (f: any) => void,
): FilterDef[] => {
    switch (filters.type) {
        case "mastery":
            return [
                {
                    id: "hideNonPrime",
                    label: "Hide Non Primes",
                    checked: filters.hideNonPrime,
                    onChange: (val) =>
                        setFilters({ ...filters, hideNonPrime: val }),
                },
                {
                    id: "hidePrime",
                    label: "Hide Primes",
                    checked: filters.hidePrime,
                    onChange: (val) =>
                        setFilters({ ...filters, hidePrime: val }),
                },
                {
                    id: "hideUnowned",
                    label: "Hide Unonwed",
                    checked: filters.hideUnowned,
                    onChange: (val) =>
                        setFilters({ ...filters, hideUnowned: val }),
                },
                {
                    id: "hideCraftable",
                    label: "Hide Craftable",
                    checked: filters.hideCraftable,
                    onChange: (val) =>
                        setFilters({ ...filters, hideCraftable: val }),
                },
                {
                    id: "hideOwned",
                    label: "Hide Owned",
                    checked: filters.hideOwned,
                    onChange: (val) =>
                        setFilters({ ...filters, hideOwned: val }),
                },
                {
                    id: "hideMastered",
                    label: "Hide Mastered",
                    checked: filters.hideMastered,
                    onChange: (val) =>
                        setFilters({ ...filters, hideMastered: val }),
                },
                {
                    id: "hideHelminthed",
                    label: "Hide Helminthed",
                    checked: filters.hideHelminthed,
                    onChange: (val) =>
                        setFilters({ ...filters, hideHelminthed: val }),
                },
            ];

        case "tasks":
            return [
                {
                    id: "favoriteFirst",
                    label: "Favorites First",
                    checked: filters.favoriteFirst,
                    onChange: (val) =>
                        setFilters({ ...filters, favoriteFirst: val }),
                },
                {
                    id: "hideIncomplete",
                    label: "Hide Incompleted",
                    checked: filters.hideIncomplete,
                    onChange: (val) =>
                        setFilters({ ...filters, hideIncomplete: val }),
                },
                {
                    id: "hideComplete",
                    label: "Hide Completed",
                    checked: filters.hideComplete,
                    onChange: (val) =>
                        setFilters({ ...filters, hideComplete: val }),
                },
                {
                    id: "hideFavorite",
                    label: "Hide Favorites",
                    checked: filters.hideFavorite,
                    onChange: (val) =>
                        setFilters({ ...filters, hideFavorite: val }),
                },
                {
                    id: "hideNonFavorite",
                    label: "Hide Non Favorites",
                    checked: filters.hideNonFavorite,
                    onChange: (val) =>
                        setFilters({ ...filters, hideNonFavorite: val }),
                },
            ];

        default:
            return [];
    }
};
