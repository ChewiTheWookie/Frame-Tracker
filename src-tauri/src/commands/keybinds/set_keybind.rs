use crate::config::keybinds::get_default_keybinds;
use crate::ActiveProfile;
use crate::{
    models::keybinds::{KeyConfig, KeybindRegistry},
    utils::paths::get_profile_dir,
};
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn set_keybind(
    app: AppHandle,
    id: String,
    config: KeyConfig,
    active_profile: State<'_, ActiveProfile>,
) -> Result<(), String> {
    let profile_dir = get_profile_dir(&app, &active_profile);
    let path = profile_dir.join("keybinds.json");

    let mut registry: KeybindRegistry = if path.exists() {
        let data = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).unwrap_or_else(|_| get_default_keybinds())
    } else {
        get_default_keybinds()
    };

    if let Some(item) = registry.iter_mut().find(|k| k.id == id) {
        item.config = config;
    } else {
        return Err(format!("Keybind ID '{}' not found in registry", id));
    }

    let json = serde_json::to_string_pretty(&registry).map_err(|e| e.to_string())?;
    std::fs::write(path, json).map_err(|e| e.to_string())?;

    Ok(())
}
