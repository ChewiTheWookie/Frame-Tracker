use crate::database::db::UserDb;
use crate::database::repositories::task_repo;
use crate::models::database::filters::TaskFilters;
use crate::models::database::task::Task;
use tauri::State;
use tauri_plugin_log::log::{ debug, error };

#[tauri::command]
pub async fn get_tasks(
    category: String,
    search: String,
    filters: TaskFilters,
    limit: i64,
    offset: i64,
    state: State<'_, UserDb>
) -> Result<Vec<Task>, String> {
    debug!(
        "get_tasks called | Category: {} | Search: '{}' | Limit: {} | Offset: {}",
        category,
        search,
        limit,
        offset
    );

    let pool_guard = state.0.lock().await;

    let tasks = task_repo
        ::find_all(&*pool_guard, &category, &search, &filters, limit, offset).await
        .map_err(|e| {
            let err = format!("Failed to fetch tasks for category '{}': {}", category, e);
            error!("{}", err);
            err
        })?;

    debug!("Retrieved {} tasks", tasks.len());

    Ok(tasks)
}
