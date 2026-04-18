use crate::database::db::{ create_user_pool, get_profile_db_path, UserDb };
use crate::ActiveProfile;
use tauri::{ Emitter, State };
use tauri_plugin_log::log::info;

#[tauri::command]
pub async fn switch_profile(
    new_profile_name: String,
    handle: tauri::AppHandle,
    user_db: State<'_, UserDb>,
    active_profile: State<'_, ActiveProfile>
) -> Result<(), String> {
    {
        let mut profile_guard = active_profile.0.lock().expect("Failed to lock ActiveProfile");
        *profile_guard = Some(new_profile_name.clone());
    }

    let new_path = get_profile_db_path(&handle, &active_profile);

    let new_pool = create_user_pool(&handle, new_path).await;

    {
        let mut pool_guard = user_db.0.lock().await;
        *pool_guard = new_pool;
    }

    info!("Switched to profile: {}", new_profile_name);

    handle.emit("profile-switched", &new_profile_name).map_err(|e| e.to_string())?;

    Ok(())
}
