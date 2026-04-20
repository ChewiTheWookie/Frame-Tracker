use tauri_plugin_log::log::{ debug, error };

use crate::database::db::UserDb;

#[tauri::command]
pub async fn get_current_profile(user_db: tauri::State<'_, UserDb>) -> Result<String, String> {
    let pool = user_db.0.lock().await;

    let row: (i64, String, String) = sqlx
        ::query_as("PRAGMA database_list")
        .fetch_one(&*pool).await
        .map_err(|e| {
            let err_msg = format!("Failed to query PRAGMA database_list: {}", e);
            error!("{}", err_msg);
            err_msg
        })?;

    let path_str = row.2;

    if path_str.is_empty() {
        debug!("Current profile path is empty, defaulting to 'Default'");
        return Ok("Default".to_string());
    }

    let path = std::path::Path::new(&path_str);

    let name = path
        .parent()
        .and_then(|p| p.file_name())
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| {
            debug!("Could not parse parent directory from path {:?}, using 'Default'", path);
            "Default".to_string()
        });

    debug!("Detected current profile: {} (Path: {})", name, path_str);

    Ok(name)
}
