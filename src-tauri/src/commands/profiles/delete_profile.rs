use std::fs;
use crate::database::db::{ UserDb };
use tauri::{ AppHandle, Manager, State };

#[tauri::command]
pub async fn delete_profile(
    handle: AppHandle,
    user_db: State<'_, UserDb>,
    name: String
) -> Result<(), String> {
    if name == "Default" {
        return Err("Cannot delete the Default profile.".into());
    }

    let current_pool = user_db.0.lock().await;
    let row: (i64, String, String) = sqlx
        ::query_as("PRAGMA database_list")
        .fetch_one(&*current_pool).await
        .map_err(|e| e.to_string())?;

    let path = std::path::Path::new(&row.2);
    let current_name = path
        .parent()
        .and_then(|p| p.file_name())
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "Default".to_string());

    if name == current_name {
        return Err("Cannot delete the profile you are currently using.".into());
    }

    let app_dir = handle.path().app_data_dir().expect("Failed to get AppData dir");
    let profile_path = app_dir.join("profiles").join(&name);

    if profile_path.exists() {
        fs::remove_dir_all(profile_path).map_err(|e| e.to_string())?;
    }

    Ok(())
}
