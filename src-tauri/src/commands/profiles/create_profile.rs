use crate::database::db::create_user_pool;
use crate::ActiveProfile;
use tauri::{Manager, State};

#[tauri::command]
pub async fn create_profile(
    name: String,
    handle: tauri::AppHandle,
    _state: State<'_, ActiveProfile>,
) -> Result<(), String> {
    if name.trim().is_empty() || name.contains('.') || name.contains('/') || name.contains('\\') {
        return Err("Invalid profile name".into());
    }

    let app_dir = handle
        .path()
        .app_data_dir()
        .expect("Failed to get AppData dir");
    let new_profile_path = app_dir.join("profiles").join(&name).join("user_profile.db");

    if new_profile_path.exists() {
        return Err("Profile already exists".into());
    }

    let _ = create_user_pool(&handle, new_profile_path).await;

    Ok(())
}
