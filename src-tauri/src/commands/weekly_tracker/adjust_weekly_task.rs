use crate::database::db::DbState;
use crate::database::services::weekly_service;

#[tauri::command]
pub async fn adjust_weekly_task(
    state: tauri::State<'_, DbState>,
    id: String,
    is_increment: bool
) -> Result<(), String> {
    weekly_service
        ::adjust_weekly_task(&state.pool, &id, is_increment).await
        .map_err(|e| e.to_string())
}
