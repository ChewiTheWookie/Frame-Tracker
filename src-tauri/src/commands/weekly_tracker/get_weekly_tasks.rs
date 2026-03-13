use crate::database::db::DbState;
use crate::models::weekly_tracker::tasks::WeeklyTask;
use crate::models::filters::WeeklyFilters;
use crate::database::services::get_merged_weekly;
use tauri::State;

#[tauri::command]
pub async fn get_weekly_tasks(
    state: State<'_, DbState>,
    search: String,
    active_category: String,
    filters: WeeklyFilters
) -> Result<Vec<WeeklyTask>, String> {
    get_merged_weekly::get_merged_weekly(&state.pool, search, active_category, filters).await
}
