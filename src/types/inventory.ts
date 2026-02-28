export const MASTERY_CATEGORIES = [
    "All",
    "Warframes",
    "Primary",
    "Secondary",
    "Melee",
    "Companions",
    "Arch Weapons",
    "Modular",
    "Vehicles",
    "Unknown",
] as const;

export type Category = (typeof MASTERY_CATEGORIES)[number];

export interface Item {
    id: string;
    name: string;
    image: string;
    category: Category;
    mastered: boolean;
    helminthed: boolean;
    craftable: boolean;
    owned: boolean;
    isFeedable?: boolean;
    parts?: Record<string, boolean>;
}
