import { PATHS } from "./paths";

import { CalendarCheck, LucideIcon, Telescope, Settings } from "lucide-react";

interface RouteMetadata {
    label: string;
    icon?: LucideIcon;
    showInNav: boolean;
}

export const ROUTE_METADATA: Record<string, RouteMetadata> = {
    [PATHS.Mastery]: {
        label: "Mastery Tracker",
        icon: Telescope,
        showInNav: true,
    },
    [PATHS.Tasks]: {
        label: "Task Tracker",
        icon: CalendarCheck,
        showInNav: true,
    },
    [PATHS.Settings]: {
        label: "Settings",
        icon: Settings,
        showInNav: true,
    },
    [PATHS.Acknowledgments]: {
        label: "Acknowledgments",
        showInNav: false,
    },
};
