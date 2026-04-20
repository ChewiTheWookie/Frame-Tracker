use crate::config::keybinds::get_default_keybinds;
use crate::ActiveProfile;
use crate::{ models::keybinds::{ KeyConfig, KeybindRegistry }, utils::paths::get_profile_dir };
use tauri::{ AppHandle, State };
use tauri_plugin_log::log::{ debug, error, info, warn };

#[tauri::command]
pub async fn set_keybind(
    app: AppHandle,
    id: String,
    config: KeyConfig,
    active_profile: State<'_, ActiveProfile>
) -> Result<(), String> {
    debug!("set_keybind called | ID: {} | Config: {:?}", id, config);

    let profile_dir = get_profile_dir(&app, &active_profile);
    let path = profile_dir.join("keybinds.json");

    let mut registry: KeybindRegistry = if path.exists() {
        let data = std::fs::read_to_string(&path).map_err(|e| {
            let err_msg = format!("Failed to read keybind file at {:?}: {}", path, e);
            error!("{}", err_msg);
            err_msg
        })?;

        serde_json::from_str(&data).unwrap_or_else(|e| {
            warn!("Failed to parse keybinds.json ({}), falling back to defaults", e);
            get_default_keybinds()
        })
    } else {
        info!("Keybinds file not found, creating new registry from defaults");
        get_default_keybinds()
    };

    if let Some(item) = registry.iter_mut().find(|k| k.id == id) {
        info!("Updating keybind config for: {}", id);
        item.config = config;
    } else {
        let err_msg = format!("Keybind ID '{}' not found in registry", id);
        error!("{}", err_msg);
        return Err(err_msg);
    }

    let json = serde_json::to_string_pretty(&registry).map_err(|e| {
        let err_msg = format!("Failed to serialize keybinds: {}", e);
        error!("{}", err_msg);
        err_msg
    })?;

    std::fs::write(&path, json).map_err(|e| {
        let err_msg = format!("Failed to write keybinds to disk: {}", e);
        error!("{}", err_msg);
        err_msg
    })?;

    info!("Successfully saved keybind '{}'", id);
    Ok(())
}
