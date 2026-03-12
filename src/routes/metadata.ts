import { PATHS } from "./paths";
import { LucideIcon, Telescope, CalendarCheck, Info } from "lucide-react";

interface RouteMetadata {
    label: string;
    icon: LucideIcon;
    storeType: "inventory" | "weekly" | "none";
    showInNav: boolean;
    features: {
        tabs: boolean;
        saveIndicator: boolean;
        searchBar: boolean;
        stats: boolean;
    };
}

export const ROUTE_REGISTRY: Record<string, RouteMetadata> = {
    [PATHS.Mastery]: {
        label: "Mastery Tracker",
        icon: Telescope,
        storeType: "inventory",
        showInNav: true,
        features: {
            tabs: true,
            saveIndicator: true,
            searchBar: true,
            stats: true,
        },
    },
    [PATHS.Weekly]: {
        label: "Weekly Task",
        icon: CalendarCheck,
        storeType: "weekly",
        showInNav: true,
        features: {
            tabs: true,
            saveIndicator: true,
            searchBar: true,
            stats: true,
        },
    },
    [PATHS.Acknowledgments]: {
        label: "Acknowledgments",
        icon: Info,
        storeType: "none",
        showInNav: true,
        features: {
            tabs: false,
            saveIndicator: false,
            searchBar: false,
            stats: false,
        },
    },
};
