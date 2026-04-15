use tauri::Emitter;

use crate::database::db::{ UserDb, create_user_pool, get_profile_db_path };

#[tauri::command]
pub async fn switch_profile(
    new_profile_name: String,
    handle: tauri::AppHandle,
    user_db: tauri::State<'_, UserDb>
) -> Result<(), String> {
    let new_path = get_profile_db_path(&handle, Some(&new_profile_name));

    let new_pool = create_user_pool(&handle, new_path).await;

    let mut pool_guard = user_db.0.lock().await;
    *pool_guard = new_pool;

    drop(pool_guard);

    handle.emit("profile-switched", &new_profile_name).map_err(|e| e.to_string())?;

    Ok(())
}
