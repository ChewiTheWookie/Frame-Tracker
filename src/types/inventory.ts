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

export type Category = (typeof MASTERY_CATEGORIES)[number];

export interface Item {
    id: string;
    name: string;
    image: string;
    category: Category;
    isPrime: boolean;
    isFeedable: boolean;
    mastered: boolean;
    helminthed: boolean;
    craftable: boolean;
    owned: boolean;
    parts?: Record<string, boolean>;
}
