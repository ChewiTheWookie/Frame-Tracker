use crate::models::keybinds::{ KeyConfig, KeybindDefinition, KeybindRegistry };

pub fn get_default_keybinds() -> KeybindRegistry {
    let mut m = KeybindRegistry::new();

    let mut add = |id: &str, label: &str, group: &str, key: &str, ctrl: bool, shift: bool| {
        m.insert(id.to_string(), KeybindDefinition {
            label: label.to_string(),
            group: group.to_string(),
            config: KeyConfig {
                key: key.to_string(),
                ctrl,
                shift,
                alt: false,
                is_global: false,
            },
        });
    };

    add("FOCUS_SEARCH", "Focus Searchbar", "Search & Filters", "f", true, false);
    add("CLEAR_SEARCH", "Clear Searchbar", "Search & Filters", "escape", false, false);
    add("TOGGLE_FILTERS_WINDOW", "Toggle Advanced Filters", "Search & Filters", "f", true, true);

    add("CYCLE_CATEGORY_TAB", "Next Category", "Navigation", "tab", true, false);
    add("BACK_CYCLE_CATEGORY_TAB", "Previous Category", "Navigation", "tab", true, true);
    add("CYCLE_PAGE", "Next Page", "Navigation", "tab", false, false);
    add("BACK_CYCLE_PAGE", "Previous Page", "Navigation", "tab", false, true);

    m
}
