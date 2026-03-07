use crate::database::services::weekly_service;

#[tauri::command]
pub fn get_next_reset(category: String, interval: Option<String>) -> Result<i64, String> {
    let timestamp = weekly_service::get_next_reset_timestamp(category, interval);
    Ok(timestamp)
}
