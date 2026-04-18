import { MASTERY_CATEGORIES, TASK_CATEGORIES } from "@/types/categories";
import { PATHS } from "./paths";
import {
    CalendarCheck,
    LucideIcon,
    Telescope,
    Settings,
    CircleUserRound,
    Guitar,
} from "lucide-react";
import { useMasteryStore } from "@/stores/useMasteryStore";
import { useSavedSongStore } from "@/stores/useSavedSongStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useLicenseStore } from "@/stores/useLicenseStore";

type StoreHook = (selector: (state: any) => any) => any;

interface RouteMetadata {
    label: string;
    icon?: LucideIcon;

    store?: StoreHook;

    showInNav: boolean;
    isCycleTarget?: boolean;

    hasSearch?: boolean;
    useInternalSearch?: boolean;
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

        store: useMasteryStore,

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

        store: useTaskStore,

        showInNav: true,
        isCycleTarget: true,

        hasSearch: true,
        hasCategory: true,
        categories: TASK_CATEGORIES,

        hasStatBar: true,
        statLabel: "Completed",
    },
    [PATHS.Music]: {
        label: "Shawzin Saver",
        icon: Guitar,

        store: useSavedSongStore,

        showInNav: true,
        isCycleTarget: true,
        hasSearch: true,
        useInternalSearch: true,
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

        store: useLicenseStore,

        showInNav: false,
        hasSearch: true,
    },
    [PATHS.Keybinds]: {
        label: "Keybinds",
        showInNav: false,
    },
};
