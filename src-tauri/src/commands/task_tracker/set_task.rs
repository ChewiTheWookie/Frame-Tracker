use tauri::State;
use crate::database::db::UserDb;
use crate::database::repositories::task_repo;
use crate::database::services::task_services::{ get_current_period_start, calculate_rolling_reset };
use crate::models::database::task::Task;

#[tauri::command]
pub async fn set_task(state: State<'_, UserDb>, id: String, count: i32) -> Result<Task, String> {
    let pool = &state.0;

    let task = task_repo
        ::find_by_id(pool, &id).await
        .map_err(|e| format!("Failed to find task: {}", e))?;

    let interval_str = task.reset_interval.as_deref().unwrap_or("daily");

    let is_rolling =
        !interval_str.to_lowercase().starts_with("daily") &&
        !interval_str.to_lowercase().starts_with("weekly") &&
        !interval_str.to_lowercase().ends_with("_world");

    let final_reset_time = if is_rolling && count == 0 {
        calculate_rolling_reset(interval_str)
    } else {
        get_current_period_start(interval_str)
    };

    task_repo
        ::update_completions(pool, &id, count, final_reset_time.to_rfc3339()).await
        .map_err(|e| e.to_string())
}
