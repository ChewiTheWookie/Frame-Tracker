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

export type MasteryCategories = (typeof MASTERY_CATEGORIES)[number];

export interface Item {
    id: string;
    name: string;
    image: string;
    category: MasteryCategories;
    isPrime: boolean;
    isFeedable: boolean;
    components: { name: string }[];
    mastered: boolean;
    helminthed: boolean;
    owned: boolean;
    craftable: boolean;
    parts: Record<string, boolean>;
}
