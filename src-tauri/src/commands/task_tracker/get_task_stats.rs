use tauri::State;
use crate::database::db::UserDb;
use crate::database::repositories::task_repo;
use crate::models::database::stats::TaskStats;

#[tauri::command]
pub async fn get_task_stats(
    state: State<'_, UserDb>,
    category: String
) -> Result<TaskStats, String> {
    task_repo::get_stats(&state.0, &category).await.map_err(|e| e.to_string())
}
