export type KeybindAction =
    | "FOCUS_SEARCH"
    | "CLEAR_SEARCH"
    | "TOGGLE_FILTERS_WINDOW"
    | "CYCLE_CATEGORY_TAB"
    | "BACK_CYCLE_CATEGORY_TAB"
    | "CYCLE_PAGE"
    | "BACK_CYCLE_PAGE"
    | "MASTERY_PAGE"
    | "TASK_PAGE"
    | "MUSIC_PAGE"
    | "PROFILE_PAGE"
    | "SETTINGS_PAGE";

export interface KeyConfig {
    key: string;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    isGlobal: boolean;
}

export interface KeybindDefinition {
    id: KeybindAction;
    label: string;
    group: string;
    config: KeyConfig;
}

export type KeybindRegistry = KeybindDefinition[];
