import { MASTERY_CATEGORIES, TASK_CATEGORIES } from "@/types/categories";
import { PATHS } from "./paths";

import {
    CalendarCheck,
    LucideIcon,
    Telescope,
    Settings,
    CircleUserRound,
} from "lucide-react";

interface RouteMetadata {
    label: string;
    icon?: LucideIcon;

    showInNav: boolean;
    isCycleTarget?: boolean;

    hasSearch?: boolean;
    hasCategory?: boolean;
    categories?: readonly string[];

    hasStatBar?: boolean;
    statLabel?: string;
    hStatLabel?: string;
}

export const ROUTE_METADATA: Record<string, RouteMetadata> = {
    [PATHS.Mastery]: {
        label: "Mastery Tracker",
        icon: Telescope,

        showInNav: true,
        isCycleTarget: true,

        hasSearch: true,
        hasCategory: true,
        categories: MASTERY_CATEGORIES,

        hasStatBar: true,
        statLabel: "Mastered",
        hStatLabel: "Helminthed",
    },
    [PATHS.Tasks]: {
        label: "Task Tracker",
        icon: CalendarCheck,

        showInNav: true,
        isCycleTarget: true,

        hasSearch: true,
        hasCategory: true,
        categories: TASK_CATEGORIES,

        hasStatBar: true,
        statLabel: "Completed",
    },
    [PATHS.Profile]: {
        label: "Profile",
        icon: CircleUserRound,
        showInNav: true,
    },
    [PATHS.Settings]: {
        label: "Settings",
        icon: Settings,
        showInNav: true,
    },
    [PATHS.Acknowledgments]: {
        label: "Third-Party Software Notices",
        showInNav: false,
    },
};
