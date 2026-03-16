export const TASK_CATEGORIES = ["All", "Daily", "Weekly", "Other"] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const MASTERY_CATEGORIES = [
    "All",
    "Warframes",
    "Primary",
    "Secondary",
    "Melee",
    "Companions",
    "Vehicles",
    "Arch Weapons",
    "Modular",
] as const;
export type MasteryCategory = (typeof MASTERY_CATEGORIES)[number];
