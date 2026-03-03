export const WEEKLY_CATEGORIES = ["All", "Daily", "Weekly", "Other"] as const;

export interface WeeklyTask {
    id: string;
    name: string;
    category: string;
    currentCompletions: number;
    maxCompletions: number;
    lastReset: string;
}
