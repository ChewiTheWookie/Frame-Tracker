use tauri::Manager;

use crate::models::keybinds::KeybindRegistry;

#[tauri::command]
pub async fn get_keybinds(app: tauri::AppHandle) -> Result<KeybindRegistry, String> {
    let defaults = crate::config::keybinds::get_default_keybinds();

    let path = app.path().app_config_dir().unwrap().join("keybinds.json");

    if !path.exists() {
        return Ok(defaults);
    }

    let file_data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
    let mut user_registry: KeybindRegistry = serde_json
        ::from_str(&file_data)
        .map_err(|e| e.to_string())?;

    for (key, def) in defaults {
        user_registry.entry(key).or_insert(def);
    }

    Ok(user_registry)
}
