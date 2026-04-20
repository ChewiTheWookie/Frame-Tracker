use crate::ActiveProfile;
use std::fs;
use std::path::{ Path, PathBuf };
use tauri::{ AppHandle, Manager };
use tauri_plugin_log::log::{ debug, error, info, warn };

pub fn resolve_profile_name(profiles_dir: &Path) -> String {
    debug!("Resolving profile name from: {:?}", profiles_dir);

    if let Ok(entries) = fs::read_dir(profiles_dir) {
        let mut first_folder = None;

        for entry in entries.flatten() {
            if let Ok(file_type) = entry.file_type() {
                if file_type.is_dir() {
                    let name = entry.file_name().to_string_lossy().into_owned();
                    if name == "Default" {
                        debug!("Found 'Default' profile.");
                        return name;
                    }
                    if first_folder.is_none() {
                        first_folder = Some(name);
                    }
                }
            }
        }
        if let Some(folder) = first_folder {
            debug!("Selected fallback profile: {}", folder);
            return folder;
        }
    }

    warn!("No profiles found. Defaulting to 'Default'.");
    "Default".to_string()
}

pub fn get_profile_dir(handle: &AppHandle, active_profile: &ActiveProfile) -> PathBuf {
    let app_dir = handle.path().app_data_dir().expect("Failed to get AppData dir");
    let profiles_dir = app_dir.join("profiles");

    let profile_guard = active_profile.0.lock().expect("Failed to lock profile");

    let target_name = match &*profile_guard {
        Some(name) => {
            debug!("Using active profile: {}", name);
            name.clone()
        }
        None => {
            let resolved = resolve_profile_name(&profiles_dir);
            debug!("No active profile set. Resolved to: {}", resolved);
            resolved
        }
    };

    let profile_dir = profiles_dir.join(&target_name);
    if !profile_dir.exists() {
        info!("Profile directory does not exist. Creating: {:?}", profile_dir);
        if let Err(e) = std::fs::create_dir_all(&profile_dir) {
            error!("Failed to create profile directory: {}", e);
        }
    }
    profile_dir
}

pub fn get_profile_db_path(handle: &AppHandle, active_profile: &ActiveProfile) -> PathBuf {
    let db_path = get_profile_dir(handle, active_profile).join("user_profile.db");
    debug!("Resolved profile DB path: {:?}", db_path);
    db_path
}
