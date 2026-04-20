use crate::database::db::UserDb;
use std::fs;
use tauri::{ AppHandle, Manager, State };
use tauri_plugin_log::log::{ debug, error, info, warn };

#[tauri::command]
pub async fn set_profile_name(
    handle: AppHandle,
    user_db: State<'_, UserDb>,
    old_name: String,
    new_name: String
) -> Result<(), String> {
    debug!("set_profile_name called | Old: '{}' -> New: '{}'", old_name, new_name);

    if old_name == "Default" {
        let err_msg = "Attempted to rename the protected 'Default' profile.".to_string();
        warn!("{}", err_msg);
        return Err(err_msg.into());
    }

    let current_pool = user_db.0.lock().await;
    let row: (i64, String, String) = sqlx
        ::query_as("PRAGMA database_list")
        .fetch_one(&*current_pool).await
        .map_err(|e| {
            let err = format!("Failed to query active database list during rename: {}", e);
            error!("{}", err);
            err
        })?;

    let path = std::path::Path::new(&row.2);
    let current_name = path
        .parent()
        .and_then(|p| p.file_name())
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "Default".to_string());

    if old_name == current_name {
        let err_msg =
            format!("Cannot rename profile '{}' because it is currently active.", old_name);
        warn!("{}", err_msg);
        return Err(err_msg.into());
    }

    let app_dir = handle
        .path()
        .app_data_dir()
        .map_err(|e| {
            let err = format!("Failed to resolve AppData directory: {}", e);
            error!("{}", err);
            err
        })?;

    let old_path = app_dir.join("profiles").join(&old_name);
    let new_path = app_dir.join("profiles").join(&new_name);

    if new_path.exists() {
        let err_msg = format!("Rename failed: Target name '{}' already exists.", new_name);
        warn!("{}", err_msg);
        return Err("A profile with that name already exists.".into());
    }

    info!("Renaming profile directory: {:?} -> {:?}", old_path, new_path);

    fs::rename(&old_path, &new_path).map_err(|e| {
        let err_msg = format!(
            "IO Error renaming profile from '{}' to '{}': {}",
            old_name,
            new_name,
            e
        );
        error!("{}", err_msg);
        err_msg
    })?;

    info!("Successfully renamed profile '{}' to '{}'", old_name, new_name);

    Ok(())
}
