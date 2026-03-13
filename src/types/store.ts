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
}
