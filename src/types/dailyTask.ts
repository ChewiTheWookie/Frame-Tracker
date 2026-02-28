export const DAILY_CATEGORIES = [
    "All",
    "Syndicate",
    "Sortie",
    "Farming",
    "Invasion",
    "Unknown",
] as const;

export type Category = (typeof DAILY_CATEGORIES)[number];

export interface DailyTask {
    id: string;
    name: string;
    category: Category;
    description: string;
    completed: boolean;
}
