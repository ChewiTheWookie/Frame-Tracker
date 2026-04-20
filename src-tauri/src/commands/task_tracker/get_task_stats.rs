use crate::database::db::UserDb;
use crate::database::repositories::task_repo;
use crate::models::database::stats::TaskStats;
use tauri::State;
use tauri_plugin_log::log::{ debug, error };

#[tauri::command]
pub async fn get_task_stats(
    state: State<'_, UserDb>,
    category: String,
    filters: crate::models::database::filters::TaskFilters
) -> Result<TaskStats, String> {
    debug!("get_task_stats called | Category: {} | Filters: {:?}", category, filters);

    let pool_guard = state.0.lock().await;

    let stats = task_repo::get_stats(&*pool_guard, &category, &filters).await.map_err(|e| {
        let err = format!("Failed to fetch task stats for category '{}': {}", category, e);
        error!("{}", err);
        err
    })?;

    debug!("Successfully retrieved stats for category: {}", category);

    Ok(stats)
}
