export type KeybindAction =
    | "FOCUS_SEARCH"
    | "CLEAR_SEARCH"
    | "TOGGLE_FILTERS_WINDOW"
    | "CYCLE_CATEGORY_TAB"
    | "BACK_CYCLE_CATEGORY_TAB"
    | "CYCLE_PAGE"
    | "BACK_CYCLE_PAGE";

export interface KeyConfig {
    key: string;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    isGlobal: boolean;
}

export interface KeybindDefinition {
    label: string;
    group: string;
    config: KeyConfig;
}

export type KeybindRegistry = Record<string, KeybindDefinition>;
