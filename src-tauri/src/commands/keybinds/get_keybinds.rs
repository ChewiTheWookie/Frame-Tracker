use tauri::{ AppHandle, State };

use crate::{
    ActiveProfile,
    config::keybinds::get_default_keybinds,
    models::keybinds::KeybindRegistry,
    utils::paths::get_profile_dir,
};

#[tauri::command]
pub async fn get_keybinds(
    app: AppHandle,
    active_profile: State<'_, ActiveProfile>
) -> Result<KeybindRegistry, String> {
    let mut defaults = get_default_keybinds();

    let profile_dir = get_profile_dir(&app, &active_profile);
    let path = profile_dir.join("keybinds.json");

    if !path.exists() {
        return Ok(defaults);
    }

    let file_data = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let saved_registry: KeybindRegistry = match serde_json::from_str(&file_data) {
        Ok(data) => data,
        Err(_) => {
            eprintln!("Old keybind format detected. Resetting to defaults.");
            return Ok(defaults);
        }
    };

    for default_item in defaults.iter_mut() {
        if let Some(saved_item) = saved_registry.iter().find(|s| s.id == default_item.id) {
            default_item.config = saved_item.config.clone();
        }
    }

    Ok(defaults)
}
