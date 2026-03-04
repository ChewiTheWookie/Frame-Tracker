export const WEEKLY_CATEGORIES = ["All", "Daily", "Weekly", "Other"] as const;

export type WeeklyCategories = (typeof WEEKLY_CATEGORIES)[number];

export interface WeeklyTask {
    id: string;
    name: string;
    category: WeeklyCategories;
    currentCompletions: number;
    maxCompletions: number;
    lastReset: string;
    tags: string[] | null;
    resetInterval: string | null;
}
