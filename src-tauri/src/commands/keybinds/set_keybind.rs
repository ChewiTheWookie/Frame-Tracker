use std::fs;
use tauri::{ AppHandle, Manager, Runtime };
use crate::models::keybinds::KeybindRegistry;

#[tauri::command]
pub async fn set_keybind<R: Runtime>(
    app: AppHandle<R>,
    mapping: KeybindRegistry
) -> Result<(), String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    if !config_dir.exists() {
        fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    }

    let config_path = config_dir.join("keybinds.json");

    let json = serde_json::to_string_pretty(&mapping).map_err(|e| e.to_string())?;

    fs::write(config_path, json).map_err(|e| e.to_string())?;

    Ok(())
}
