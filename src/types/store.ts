import { Item } from "./inventory";
import { WeeklyTask } from "./weekly";

export type UnifiedData = Item | WeeklyTask;

export interface NormalizedStore {
    data: UnifiedData[];
    loading: boolean;
    search: string;
    setSearch: (val: string) => void;
    activeCategory: string;
    filters: Record<string, boolean>;
    toggleFilter: (key: any) => void;

    showAllBacks: boolean;
    toggleShowAllBacks: () => void;

    adjustTask?: (id: string, isIncrement: boolean) => Promise<void>;
    fetchTasks?: () => Promise<void>;

    toggleStatus?: (
        id: string,
        field: "mastered" | "helminthed" | "owned",
    ) => Promise<void>;
    togglePart?: (itemId: string, partName: string) => Promise<void>;
}
