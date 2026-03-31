export type KeybindAction =
    | "FOCUS_SEARCH"
    | "CLEAR_SEARCH"
    | "TOGGLE_FILTERS_WINDOW"
    | "CYCLE_CATEGORY_TAB"
    | "BACK_CYCLE_CATEGORY_TAB"
    | "CYCLE_PAGE"
    | "BACK_CYCLE_PAGE";

export type KeybindGroup = "Navigation" | "Search & Filters";

export interface KeyConfig {
    key: string;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    isGlobal: boolean;
}

const createBind = (
    key: string,
    overrides: Partial<KeyConfig> = {},
): KeyConfig => ({
    key,
    ctrl: false,
    shift: false,
    alt: false,
    isGlobal: false,
    ...overrides,
});

interface KeybindDefinition {
    label: string;
    group: KeybindGroup;
    default: KeyConfig;
}

export const KEYBIND_METADATA: Record<KeybindAction, KeybindDefinition> = {
    FOCUS_SEARCH: {
        label: "Focus Searchbar",
        group: "Search & Filters",
        default: createBind("f", { ctrl: true }),
    },
    CLEAR_SEARCH: {
        label: "Clear Searchbar",
        group: "Search & Filters",
        default: createBind("escape"),
    },
    TOGGLE_FILTERS_WINDOW: {
        label: "Toggle Advanced Filters Window",
        group: "Search & Filters",
        default: createBind("f", { ctrl: true, shift: true }),
    },
    CYCLE_CATEGORY_TAB: {
        label: "Next Category",
        group: "Navigation",
        default: createBind("tab", { ctrl: true }),
    },
    BACK_CYCLE_CATEGORY_TAB: {
        label: "Previous Category",
        group: "Navigation",
        default: createBind("tab", { ctrl: true, shift: true }),
    },
    CYCLE_PAGE: {
        label: "Next Page",
        group: "Navigation",
        default: createBind("tab"),
    },
    BACK_CYCLE_PAGE: {
        label: "Previous Page",
        group: "Navigation",
        default: createBind("tab", { shift: true }),
    },
};

export const DEFAULT_BINDS = Object.fromEntries(
    Object.entries(KEYBIND_METADATA).map(([action, def]) => [
        action,
        def.default,
    ]),
) as Record<KeybindAction, KeyConfig>;
