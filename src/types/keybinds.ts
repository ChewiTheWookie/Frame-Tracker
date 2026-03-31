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

export type KeyMapping = Record<KeybindAction, KeyConfig>;

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

export const DEFAULT_BINDS: KeyMapping = {
    FOCUS_SEARCH: createBind("f", { ctrl: true }),
    CLEAR_SEARCH: createBind("escape"),
    TOGGLE_FILTERS_WINDOW: createBind("f", { ctrl: true, shift: true }),

    CYCLE_CATEGORY_TAB: createBind("tab", { ctrl: true }),
    BACK_CYCLE_CATEGORY_TAB: createBind("tab", { ctrl: true, shift: true }),

    CYCLE_PAGE: createBind("tab"),
    BACK_CYCLE_PAGE: createBind("tab", { shift: true }),
};
