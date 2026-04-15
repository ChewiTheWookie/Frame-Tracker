use crate::database::db::UserDb;
use crate::database::repositories::task_repo;
use crate::models::database::filters::TaskFilters;
use crate::models::database::task::Task;
use tauri::State;

#[tauri::command]
pub async fn get_tasks(
    category: String,
    search: String,
    filters: TaskFilters,
    limit: i64,
    offset: i64,
    state: State<'_, UserDb>
) -> Result<Vec<Task>, String> {
    let pool_guard = state.0.lock().await;

    let task = task_repo
        ::find_all(&*pool_guard, &category, &search, &filters, limit, offset).await
        .map_err(|e| e.to_string())?;

    Ok(task)
}
