use crate::database::db::create_user_pool;
use crate::ActiveProfile;
use tauri::{ Manager, State };
use tauri_plugin_log::log::{ debug, error, info, warn };

#[tauri::command]
pub async fn create_profile(
    name: String,
    handle: tauri::AppHandle,
    _state: State<'_, ActiveProfile>
) -> Result<(), String> {
    debug!("create_profile called | Name: {}", name);

    if name.trim().is_empty() || name.contains('.') || name.contains('/') || name.contains('\\') {
        let err_msg = format!("Invalid profile name attempted: '{}'", name);
        warn!("{}", err_msg);
        return Err("Invalid profile name. Avoid spaces, dots, or slashes.".into());
    }

    let app_dir = handle
        .path()
        .app_data_dir()
        .map_err(|e| {
            let err = format!("Failed to resolve AppData directory: {}", e);
            error!("{}", err);
            err
        })?;

    let new_profile_path = app_dir.join("profiles").join(&name).join("user_profile.db");

    if new_profile_path.exists() {
        let err_msg = format!(
            "Creation failed: Profile '{}' already exists at {:?}",
            name,
            new_profile_path
        );
        warn!("{}", err_msg);
        return Err("Profile already exists".into());
    }

    debug!("Initializing new profile database for '{}' at {:?}", name, new_profile_path);

    create_user_pool(&handle, new_profile_path).await;

    info!("Successfully created profile: {}", name);
    Ok(())
}
