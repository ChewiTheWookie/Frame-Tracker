use tauri::{ AppHandle, State };
use crate::{
    config::keybinds::get_default_keybinds,
    models::keybinds::KeybindRegistry,
    utils::paths::get_profile_dir,
    ActiveProfile,
};

#[tauri::command]
pub async fn get_keybinds(
    app: AppHandle,
    active_profile: State<'_, ActiveProfile>
) -> Result<KeybindRegistry, String> {
    let defaults = get_default_keybinds();

    let profile_dir = get_profile_dir(&app, &active_profile);
    let path = profile_dir.join("keybinds.json");

    if !path.exists() {
        return Ok(defaults);
    }

    let file_data = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;

    let mut user_registry: KeybindRegistry = serde_json
        ::from_str(&file_data)
        .map_err(|e| e.to_string())?;

    for (key, def) in defaults {
        user_registry.entry(key).or_insert(def);
    }

    Ok(user_registry)
}
