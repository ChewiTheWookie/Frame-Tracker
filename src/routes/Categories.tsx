import { MASTERY_CATEGORIES, Category } from "../types/inventory";

export const MASTERY_CAT = MASTERY_CATEGORIES.filter(
    (cat): cat is Exclude<Category, "All"> => cat !== "All",
);
