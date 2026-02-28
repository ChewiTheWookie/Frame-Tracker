import { MASTERY_CATEGORIES } from "../types/inventory";
import { DAILY_CATEGORIES } from "../types/dailyTask";

export const MASTERY_CAT = MASTERY_CATEGORIES.filter(
    (cat) => cat !== "Unknown",
);

export const DAILY_CAT = DAILY_CATEGORIES.filter((cat) => cat !== "Unknown");
