use crate::database::db::UserDb;
use std::fs;
use tauri::{ AppHandle, Manager, State };
use tauri_plugin_log::log::{ debug, error, info, warn };

#[tauri::command]
pub async fn delete_profile(
    handle: AppHandle,
    user_db: State<'_, UserDb>,
    name: String
) -> Result<(), String> {
    debug!("delete_profile called | Target Name: {}", name);

    if name == "Default" {
        let err_msg = "Attempted to delete the protected 'Default' profile.".to_string();
        warn!("{}", err_msg);
        return Err(err_msg.into());
    }

    let current_pool = user_db.0.lock().await;
    let row: (i64, String, String) = sqlx
        ::query_as("PRAGMA database_list")
        .fetch_one(&*current_pool).await
        .map_err(|e| {
            let err = format!("Failed to query active database list: {}", e);
            error!("{}", err);
            err
        })?;

    let path = std::path::Path::new(&row.2);
    let current_name = path
        .parent()
        .and_then(|p| p.file_name())
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "Default".to_string());

    if name == current_name {
        let err_msg = format!("Cannot delete profile '{}' because it is currently in use.", name);
        warn!("{}", err_msg);
        return Err(err_msg.into());
    }

    let app_dir = handle
        .path()
        .app_data_dir()
        .map_err(|e| {
            let err = format!("Failed to get AppData dir: {}", e);
            error!("{}", err);
            err
        })?;

    let profile_path = app_dir.join("profiles").join(&name);

    if profile_path.exists() {
        info!("Deleting profile directory at: {:?}", profile_path);

        fs::remove_dir_all(&profile_path).map_err(|e| {
            let err = format!("IO Error deleting profile '{}': {}", name, e);
            error!("{}", err);
            err
        })?;

        info!("Successfully deleted profile: {}", name);
    } else {
        warn!(
            "Delete requested for '{}', but the directory does not exist at {:?}",
            name,
            profile_path
        );
    }

    Ok(())
}
