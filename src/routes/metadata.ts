import { PATHS } from "./paths";

interface RouteMetadata {
    label: string;
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
