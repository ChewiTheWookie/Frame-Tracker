use crate::database::db::DbState;
use crate::models::weekly_tracker::tasks::WeeklyTask;
use crate::database::services::weekly_service;

#[tauri::command]
pub async fn get_weekly_tasks(state: tauri::State<'_, DbState>) -> Result<Vec<WeeklyTask>, String> {
    weekly_service::get_all_weekly_tasks(&state.pool).await.map_err(|e| e.to_string())
}
