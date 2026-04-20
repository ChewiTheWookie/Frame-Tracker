use tauri::Manager;
use tauri_plugin_log::log::{ debug, error };

#[tauri::command]
pub async fn get_profile_list(handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let app_dir = handle
        .path()
        .app_data_dir()
        .map_err(|e| {
            let err = format!("Failed to resolve AppData directory: {}", e);
            error!("{}", err);
            err
        })?;

    let profiles_dir = app_dir.join("profiles");
    debug!("Scanning for profiles in: {:?}", profiles_dir);

    if !profiles_dir.exists() {
        debug!("Profiles directory does not exist, returning 'Default'");
        return Ok(vec!["Default".to_string()]);
    }

    let mut profiles = Vec::new();

    match std::fs::read_dir(&profiles_dir) {
        Ok(entries) => {
            for entry in entries.flatten() {
                if let Ok(file_type) = entry.file_type() {
                    if file_type.is_dir() {
                        let name = entry.file_name().to_string_lossy().into_owned();
                        profiles.push(name);
                    }
                }
            }
        }
        Err(e) => {
            let err_msg = format!("Failed to read profiles directory: {}", e);
            error!("{}", err_msg);
            return Err(err_msg);
        }
    }

    debug!("Found {} profile(s): {:?}", profiles.len(), profiles);

    Ok(profiles)
}
