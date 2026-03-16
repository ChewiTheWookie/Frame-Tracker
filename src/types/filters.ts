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
                    label: "hide Non Primes",
                    checked: filters.hideNonPrime,
                    onChange: (val) =>
                        setFilters({ ...filters, hideNonPrime: val }),
                },
                {
                    id: "hidePrime",
                    label: "hide Primes",
                    checked: filters.hidePrime,
                    onChange: (val) =>
                        setFilters({ ...filters, hidePrime: val }),
                },
                {
                    id: "hideUnowned",
                    label: "hide Unonwed",
                    checked: filters.hideUnowned,
                    onChange: (val) =>
                        setFilters({ ...filters, hideUnowned: val }),
                },
                {
                    id: "hideCraftable",
                    label: "hide Craftable",
                    checked: filters.hideCraftable,
                    onChange: (val) =>
                        setFilters({ ...filters, hideCraftable: val }),
                },
                {
                    id: "hideOwned",
                    label: "hide Owned",
                    checked: filters.hideOwned,
                    onChange: (val) =>
                        setFilters({ ...filters, hideOwned: val }),
                },
                {
                    id: "hideMastered",
                    label: "hide Mastered",
                    checked: filters.hideMastered,
                    onChange: (val) =>
                        setFilters({ ...filters, hideMastered: val }),
                },
                {
                    id: "hideHelminthed",
                    label: "hide Helminthed",
                    checked: filters.hideHelminthed,
                    onChange: (val) =>
                        setFilters({ ...filters, hideHelminthed: val }),
                },
            ];

        case "tasks":
            return [
                {
                    id: "hideIncomplete",
                    label: "hide Incompleted",
                    checked: filters.hideIncomplete,
                    onChange: (val) =>
                        setFilters({ ...filters, hideIncomplete: val }),
                },
                {
                    id: "hideComplete",
                    label: "hide Completed",
                    checked: filters.hideComplete,
                    onChange: (val) =>
                        setFilters({ ...filters, hideComplete: val }),
                },
            ];

        default:
            return [];
    }
};
