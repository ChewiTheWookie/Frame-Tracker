use crate::database::db::UserDb;
use crate::database::repositories::task_repo;
use crate::database::services::task_services::{ get_period_start, ResetType };
use crate::models::database::task::Task;
use chrono::Utc;
use tauri::State;

#[tauri::command]
pub async fn set_task(state: State<'_, UserDb>, id: String, count: i32) -> Result<Task, String> {
    let pool = &state.0;

    let task = task_repo
        ::find_by_id(pool, &id).await
        .map_err(|e| format!("Failed to find task: {}", e))?;

    let interval_str = task.reset_interval.as_deref().unwrap_or("Daily");
    let reset_type = ResetType::from_str(interval_str);
    let now = Utc::now();

    let final_reset_time = match reset_type {
        ResetType::Custom(duration) if count == 0 => now - duration,

        ResetType::Custom(_) => now,

        _ => get_period_start(&reset_type, now),
    };

    task_repo
        ::update_completions(pool, &id, count, final_reset_time.to_rfc3339()).await
        .map_err(|e| e.to_string())
}
