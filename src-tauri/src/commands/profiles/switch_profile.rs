use crate::database::db::{ create_user_pool, get_profile_db_path, UserDb };
use crate::ActiveProfile;
use tauri::{ Emitter, State };
use tauri_plugin_log::log::{ debug, error, info };

#[tauri::command]
pub async fn switch_profile(
    new_profile_name: String,
    handle: tauri::AppHandle,
    user_db: State<'_, UserDb>,
    active_profile: State<'_, ActiveProfile>
) -> Result<(), String> {
    debug!("switch_profile requested | Target: {}", new_profile_name);

    {
        let mut profile_guard = active_profile.0.lock().map_err(|_| {
            let err = "Failed to lock ActiveProfile mutex".to_string();
            error!("{}", err);
            err
        })?;
        *profile_guard = Some(new_profile_name.clone());
    }
    debug!("ActiveProfile state updated to: {}", new_profile_name);

    let new_path = get_profile_db_path(&handle, &active_profile);
    debug!("New profile database path resolved: {:?}", new_path);

    let new_pool = create_user_pool(&handle, new_path).await;

    {
        let mut pool_guard = user_db.0.lock().await;
        *pool_guard = new_pool;
        debug!("Database pool connection swapped successfully");
    }

    info!("Switched to profile: {}", new_profile_name);

    handle.emit("profile-switched", &new_profile_name).map_err(|e| {
        let err_msg = format!("Failed to emit profile-switched event: {}", e);
        error!("{}", err_msg);
        err_msg
    })?;

    Ok(())
}
