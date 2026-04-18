use crate::database::db::UserDb;

#[tauri::command]
pub async fn get_current_profile(user_db: tauri::State<'_, UserDb>) -> Result<String, String> {
    let pool = user_db.0.lock().await;

    let row: (i64, String, String) = sqlx::query_as("PRAGMA database_list")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    let path_str = row.2;

    if path_str.is_empty() {
        return Ok("Default".to_string());
    }

    let path = std::path::Path::new(&path_str);

    let name = path
        .parent()
        .and_then(|p| p.file_name())
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "Default".to_string());

    Ok(name)
}
