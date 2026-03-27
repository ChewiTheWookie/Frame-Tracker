import { Item } from "../types/items";
import { Task } from "../types/tasks";
import { MasteryFilterState, TaskFilterState } from "../types/filters";

type FilterEvaluator<T> = (data: T) => boolean;

const masteryRules: Partial<
    Record<keyof MasteryFilterState, FilterEvaluator<Item>>
> = {
    hideUnowned: (item) => !item.owned,
    hideCraftable: (item) => item.craftable,
    hideOwned: (item) => item.owned,
    hideMastered: (item) => item.mastered,
    hideHelminthed: (item) => item.helminthed,
};

const taskRules: Partial<Record<keyof TaskFilterState, FilterEvaluator<Task>>> =
    {
        hideComplete: (task) =>
            task.current_completions === task.max_completions,
        hideIncomplete: (task) =>
            task.current_completions !== task.max_completions,
        hideFavorite: (task) => task.favorite === 1,
        hideNonFavorite: (task) => task.favorite !== 1,
    };

export const shouldHide = <T, F extends { type: string }>(
    data: T,
    filters: F,
): boolean => {
    const rules = (
        filters.type === "mastery" ? masteryRules : taskRules
    ) as Record<string, FilterEvaluator<T>>;

    if (!rules) return false;

    const { type, ...activeFilters } = filters;

    for (const [key, filterValue] of Object.entries(activeFilters)) {
        if (filterValue === true && rules[key]) {
            if (rules[key](data)) {
                return true;
            }
        }
    }

    return false;
};
