use tauri::State;
use crate::database::db::UserDb;
use crate::database::repositories::task_repo;
use crate::models::database::filters::TaskFilters;
use crate::models::database::task::Task;

#[tauri::command]
pub async fn get_tasks(
    category: String,
    search: String,
    filters: TaskFilters,
    limit: i64,
    offset: i64,
    state: State<'_, UserDb>
) -> Result<Vec<Task>, String> {
    task_repo
        ::find_all(&state.0, &category, &search, &filters, limit, offset).await
        .map_err(|e| e.to_string())
}
