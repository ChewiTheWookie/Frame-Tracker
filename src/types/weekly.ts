export const WEEKLY_CATEGORIES = ["All", "Daily", "Weekly", "Other"] as const;

export type WeeklyCategories = (typeof WEEKLY_CATEGORIES)[number];

export type WeeklyTag =
    | "Mission"
    | "Trade"
    | "Craft"
    | "Syndicate"
    | "Search Pulse"
    | "Task"
    | "Misc";

export const TAG_FILTER_MAP: Record<string, WeeklyTag> = {
    hideMission: "Mission",
    hideTrade: "Trade",
    hideCraft: "Craft",
    hideSyndicate: "Syndicate",
    hideSearchPulse: "Search Pulse",
    hideTask: "Task",
    hideMisc: "Misc",
};

export interface WeeklyTask {
    id: string;
    name: string;
    category: WeeklyCategories;
    currentCompletions: number;
    maxCompletions: number;
    lastReset: string;
    tags: string[] | null;
    resetInterval: string | null;
    location: string | null;
    terminal: string | null;
    questRequired: string | null;
    icon: string | null;
}
