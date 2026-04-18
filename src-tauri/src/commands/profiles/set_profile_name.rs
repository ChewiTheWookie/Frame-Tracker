use crate::database::db::UserDb;
use std::fs;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub async fn set_profile_name(
    handle: AppHandle,
    user_db: State<'_, UserDb>,
    old_name: String,
    new_name: String,
) -> Result<(), String> {
    if old_name == "Default" {
        return Err("Cannot rename the Default profile.".into());
    }

    let current_pool = user_db.0.lock().await;
    let row: (i64, String, String) = sqlx::query_as("PRAGMA database_list")
        .fetch_one(&*current_pool)
        .await
        .map_err(|e| e.to_string())?;

    let path = std::path::Path::new(&row.2);
    let current_name = path
        .parent()
        .and_then(|p| p.file_name())
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "Default".to_string());

    if old_name == current_name {
        return Err("Cannot rename a profile while it is currently active.".into());
    }

    let app_dir = handle
        .path()
        .app_data_dir()
        .expect("Failed to get AppData dir");
    let old_path = app_dir.join("profiles").join(&old_name);
    let new_path = app_dir.join("profiles").join(&new_name);

    if new_path.exists() {
        return Err("A profile with that name already exists.".into());
    }

    fs::rename(old_path, new_path).map_err(|e| e.to_string())?;

    Ok(())
}
