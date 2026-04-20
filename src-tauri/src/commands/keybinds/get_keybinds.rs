use tauri::{ AppHandle, State };
use tauri_plugin_log::log::{ debug, error, info, warn };

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
    debug!("get_keybinds called");

    let mut defaults = get_default_keybinds();
    let profile_dir = get_profile_dir(&app, &active_profile);
    let path = profile_dir.join("keybinds.json");

    if !path.exists() {
        debug!("No keybinds file found at {:?}, returning defaults", path);
        return Ok(defaults);
    }

    let file_data = std::fs::read_to_string(&path).map_err(|e| {
        let err_msg = format!("Failed to read keybind file at {:?}: {}", path, e);
        error!("{}", err_msg);
        err_msg
    })?;

    let saved_registry: KeybindRegistry = match serde_json::from_str(&file_data) {
        Ok(data) => data,
        Err(e) => {
            warn!("Failed to parse keybinds.json ({}), falling back to defaults", e);
            return Ok(defaults);
        }
    };

    let mut needs_sync = false;
    let mut added_count = 0;

    for default_item in defaults.iter_mut() {
        if let Some(saved_item) = saved_registry.iter().find(|s| s.id == default_item.id) {
            default_item.config = saved_item.config.clone();
        } else {
            needs_sync = true;
            added_count += 1;
            debug!("Keybind '{}' missing from file, adding to registry", default_item.id);
        }
    }

    if saved_registry.len() != defaults.len() {
        needs_sync = true;
    }

    if needs_sync {
        info!("Syncing keybinds registry: adding {} new items", added_count);

        let new_json = serde_json::to_string_pretty(&defaults).map_err(|e| {
            let err_msg = format!("Failed to serialize keybinds for sync: {}", e);
            error!("{}", err_msg);
            err_msg
        })?;

        std::fs::write(&path, new_json).map_err(|e| {
            let err_msg = format!("Failed to write synced keybinds: {}", e);
            error!("{}", err_msg);
            err_msg
        })?;

        info!("Keybinds successfully synchronized to {:?}", path);
    }

    Ok(defaults)
}
